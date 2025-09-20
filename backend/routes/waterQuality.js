const express = require('express');
const router = express.Router();
const WaterQuality = require('../models/WaterQuality');
const Location = require('../models/Location');
const moment = require('moment');

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

    res.status(201).json({
      success: true,
      message: 'Water quality data added successfully',
      data: populatedData
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

module.exports = router;