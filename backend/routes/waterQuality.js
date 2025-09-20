const express = require('express');
const router = express.Router();
const WaterQuality = require('../models/WaterQuality');
const Location = require('../models/Location');
const Forecast = require('../models/Forecast');
const moment = require('moment');
const forecastService = require('../services/forecastService');
const alertService = require('../services/alertService');

// @route   GET /api/water-quality
// @desc    Get water quality data with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      locationId,
      startDate,
      endDate,
      parameter,
      status,
      limit = 100,
      page = 1
    } = req.query;

    // Build query
    let query = {};
    
    if (locationId) {
      query.locationId = locationId;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    if (status) {
      query.overallStatus = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const waterQualityData = await WaterQuality.find(query)
      .populate('locationId', 'name city coordinates')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await WaterQuality.countDocuments(query);

    res.json({
      success: true,
      count: waterQualityData.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: waterQualityData
    });
  } catch (error) {
    console.error('Error fetching water quality data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water quality data',
      error: error.message
    });
  }
});

// @route   GET /api/water-quality/latest
// @desc    Get latest water quality data for all locations
// @access  Public
router.get('/latest', async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true });
    const latestData = [];

    for (const location of locations) {
      const latest = await WaterQuality.findOne({ locationId: location._id })
        .sort({ timestamp: -1 })
        .populate('locationId', 'name city coordinates riverKm');
      
      if (latest) {
        latestData.push(latest);
      }
    }

    res.json({
      success: true,
      count: latestData.length,
      data: latestData
    });
  } catch (error) {
    console.error('Error fetching latest water quality data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest water quality data',
      error: error.message
    });
  }
});

// @route   GET /api/water-quality/location/:locationId
// @desc    Get water quality data for specific location
// @access  Public
router.get('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { days = 10, parameter } = req.query;

    // Get data for last N days
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    const endDate = moment().endOf('day').toDate();

    let query = {
      locationId,
      timestamp: { $gte: startDate, $lte: endDate }
    };

    const data = await WaterQuality.find(query)
      .populate('locationId', 'name city coordinates')
      .sort({ timestamp: 1 })
      .select('-__v');

    // If specific parameter requested, extract that data
    let responseData = data;
    if (parameter && data.length > 0) {
      responseData = data.map(item => ({
        timestamp: item.timestamp,
        locationId: item.locationId,
        parameter: item.parameters[parameter],
        waterQualityIndex: item.waterQualityIndex,
        overallStatus: item.overallStatus
      }));
    }

    res.json({
      success: true,
      count: responseData.length,
      parameter: parameter || 'all',
      period: `${days} days`,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching location water quality data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location water quality data',
      error: error.message
    });
  }
});

// @route   GET /api/water-quality/trends/:locationId
// @desc    Get water quality trends for a location
// @access  Public
router.get('/trends/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { days = 30 } = req.query;

    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    
    const trends = await WaterQuality.aggregate([
      {
        $match: {
          locationId: require('mongoose').Types.ObjectId(locationId),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
          },
          avgDO: { $avg: "$parameters.dissolvedOxygen.value" },
          avgBOD: { $avg: "$parameters.biochemicalOxygenDemand.value" },
          avgNitrate: { $avg: "$parameters.nitrate.value" },
          avgFecalColiform: { $avg: "$parameters.fecalColiform.value" },
          avgWQI: { $avg: "$waterQualityIndex" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    res.json({
      success: true,
      locationId,
      period: `${days} days`,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching water quality trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water quality trends',
      error: error.message
    });
  }
});

// @route   GET /api/water-quality/alerts
// @desc    Get current water quality alerts
// @access  Public
router.get('/alerts', async (req, res) => {
  try {
    const { severity = 'all' } = req.query;
    
    // Get latest data for each location
    const locations = await Location.find({ isActive: true });
    const alerts = [];

    for (const location of locations) {
      const latest = await WaterQuality.findOne({ locationId: location._id })
        .sort({ timestamp: -1 })
        .populate('locationId', 'name city');
      
      if (latest && latest.hasAlerts()) {
        const locationAlerts = [];
        const params = latest.parameters;
        
        // Check each parameter for poor status
        Object.keys(params).forEach(paramKey => {
          if (params[paramKey].status === 'poor') {
            locationAlerts.push({
              parameter: paramKey,
              value: params[paramKey].value,
              unit: params[paramKey].unit,
              status: params[paramKey].status,
              severity: 'high'
            });
          }
        });

        if (locationAlerts.length > 0) {
          alerts.push({
            location: latest.locationId,
            timestamp: latest.timestamp,
            overallStatus: latest.overallStatus,
            waterQualityIndex: latest.waterQualityIndex,
            alerts: locationAlerts
          });
        }
      }
    }

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching water quality alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water quality alerts',
      error: error.message
    });
  }
});

// @route   POST /api/water-quality
// @desc    Add new water quality measurement
// @access  Public (In production, this should be protected)
router.post('/', async (req, res) => {
  try {
    const waterQuality = new WaterQuality(req.body);
    await waterQuality.save();

    const populatedData = await WaterQuality.findById(waterQuality._id)
      .populate('locationId', 'name city coordinates');

    // Evaluate water quality and create alerts if necessary
    let alertEvaluation = null;
    try {
      if (populatedData.locationId) {
        alertEvaluation = await alertService.evaluateAndCreateAlerts(
          populatedData.toObject(),
          populatedData.locationId._id,
          populatedData.locationId.name
        );
      }
    } catch (alertError) {
      console.error('Error evaluating alerts:', alertError);
      // Don't fail the main request if alert evaluation fails
    }

    res.status(201).json({
      success: true,
      message: 'Water quality data added successfully',
      data: populatedData,
      alertEvaluation: alertEvaluation ? {
        level: alertEvaluation.summary.level,
        levelName: alertEvaluation.summary.levelName,
        alertsCreated: alertEvaluation.alertsCreated.length,
        alertsUpdated: alertEvaluation.alertsUpdated.length
      } : null
    });
  } catch (error) {
    console.error('Error adding water quality data:', error);
    res.status(400).json({
      success: false,
      message: 'Error adding water quality data',
      error: error.message
    });
  }
});

// @route   GET /api/water-quality/combined/:locationId
// @desc    Get combined 13-day data (10 days historical + 3 days forecast) for a location
// @access  Public
router.get('/combined/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    
    // Validate location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Get 10 days of historical data
    const tenDaysAgo = moment().subtract(10, 'days').startOf('day');
    const historicalData = await WaterQuality.find({
      locationId: locationId,
      timestamp: { $gte: tenDaysAgo.toDate() }
    })
    .populate('locationId', 'name city coordinates riverKm')
    .sort({ timestamp: 1 })
    .select('-__v');

    // Get or generate forecast data for next 3 days
    let forecastData = await Forecast.findOne({
      locationId: locationId,
      forecastDate: { $gte: moment().startOf('day').toDate() }
    })
    .populate('locationId', 'name city coordinates riverKm')
    .sort({ generatedAt: -1 });

    // If no recent forecast exists, generate one
    if (!forecastData) {
      try {
        await forecastService.generateLocationForecast(locationId);
        forecastData = await Forecast.findOne({
          locationId: locationId,
          forecastDate: { $gte: moment().startOf('day').toDate() }
        })
        .populate('locationId', 'name city coordinates riverKm')
        .sort({ generatedAt: -1 });
      } catch (forecastError) {
        console.warn('Could not generate forecast:', forecastError.message);
      }
    }

    // Format the combined data
    const combinedData = {
      location: location,
      historical: historicalData.map(data => ({
        ...data.toObject(),
        dataType: 'historical',
        date: moment(data.timestamp).format('YYYY-MM-DD')
      })),
      forecast: forecastData ? forecastData.predictions.map(prediction => ({
        locationId: forecastData.locationId,
        timestamp: prediction.date,
        date: moment(prediction.date).format('YYYY-MM-DD'),
        dataType: 'forecast',
        dayOffset: prediction.dayOffset,
        parameters: {
          dissolvedOxygen: {
            value: prediction.parameters.dissolvedOxygen.predicted,
            unit: 'mg/L',
            status: 'predicted',
            confidence: prediction.parameters.dissolvedOxygen.confidence,
            trend: prediction.parameters.dissolvedOxygen.trend
          },
          biochemicalOxygenDemand: {
            value: prediction.parameters.biochemicalOxygenDemand.predicted,
            unit: 'mg/L',
            status: 'predicted',
            confidence: prediction.parameters.biochemicalOxygenDemand.confidence,
            trend: prediction.parameters.biochemicalOxygenDemand.trend
          },
          nitrate: {
            value: prediction.parameters.nitrate.predicted,
            unit: 'mg/L',
            status: 'predicted',
            confidence: prediction.parameters.nitrate.confidence,
            trend: prediction.parameters.nitrate.trend
          },
          fecalColiform: {
            value: prediction.parameters.fecalColiform.predicted,
            unit: 'MPN/100ml',
            status: 'predicted',
            confidence: prediction.parameters.fecalColiform.confidence,
            trend: prediction.parameters.fecalColiform.trend
          }
        },
        waterQualityIndex: prediction.predictedWQI,
        overallStatus: prediction.predictedStatus,
        expectedWeather: prediction.expectedWeather
      })) : [],
      summary: {
        totalDays: 13,
        historicalDays: 10,
        forecastDays: 3,
        dataAvailable: {
          historical: historicalData.length,
          forecast: forecastData ? forecastData.predictions.length : 0
        }
      }
    };

    res.json({
      success: true,
      data: combinedData
    });
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching combined data',
      error: error.message
    });
  }
});

// @route   GET /api/water-quality/combined
// @desc    Get combined 13-day data for all active locations
// @access  Public
router.get('/combined', async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true });
    const combinedData = [];

    for (const location of locations) {
      try {
        // Get 10 days of historical data
        const tenDaysAgo = moment().subtract(10, 'days').startOf('day');
        const historicalData = await WaterQuality.find({
          locationId: location._id,
          timestamp: { $gte: tenDaysAgo.toDate() }
        })
        .sort({ timestamp: 1 })
        .select('-__v');

        // Get latest historical data for current status
        const latestData = historicalData.length > 0 ? historicalData[historicalData.length - 1] : null;

        combinedData.push({
          location: location,
          latestReading: latestData,
          historicalCount: historicalData.length,
          hasForecasts: true // We'll generate forecasts on demand
        });
      } catch (locationError) {
        console.warn(`Error processing location ${location.name}:`, locationError.message);
      }
    }

    res.json({
      success: true,
      count: combinedData.length,
      data: combinedData
    });
  } catch (error) {
    console.error('Error fetching combined data for all locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching combined data',
      error: error.message
    });
  }
});

module.exports = router;