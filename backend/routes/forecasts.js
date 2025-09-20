const express = require('express');
const router = express.Router();
const Forecast = require('../models/Forecast');
const WaterQuality = require('../models/WaterQuality');
const Location = require('../models/Location');
const forecastService = require('../services/forecastService');
const moment = require('moment');

// @route   GET /api/forecasts
// @desc    Get all forecasts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { locationId, days = 3 } = req.query;
    
    let query = {};
    if (locationId) {
      query.locationId = locationId;
    }

    const forecasts = await Forecast.find(query)
      .populate('locationId', 'name city coordinates')
      .sort({ generatedAt: -1 })
      .limit(10)
      .select('-__v');

    res.json({
      success: true,
      count: forecasts.length,
      data: forecasts
    });
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching forecasts',
      error: error.message
    });
  }
});

// @route   GET /api/forecasts/latest/:locationId
// @desc    Get latest forecast for a location
// @access  Public
router.get('/latest/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    
    const forecast = await Forecast.findOne({ locationId })
      .populate('locationId', 'name city coordinates')
      .sort({ generatedAt: -1 })
      .select('-__v');

    if (!forecast) {
      return res.status(404).json({
        success: false,
        message: 'No forecast found for this location'
      });
    }

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Error fetching latest forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest forecast',
      error: error.message
    });
  }
});

// @route   POST /api/forecasts/generate/:locationId
// @desc    Generate forecast for a location
// @access  Public
router.post('/generate/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    
    // Generate forecasts using the new forecasting service
    const forecasts = await forecastService.generateLocationForecast(locationId);
    
    // Save forecasts to database
    await forecastService.saveForecastsToDatabase(forecasts);

    res.json({
      success: true,
      message: `Generated ${forecasts.length} forecasts successfully`,
      count: forecasts.length,
      data: forecasts
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating forecast',
      error: error.message
    });
  }
});

// @route   POST /api/forecasts/generate-all
// @desc    Generate forecasts for all locations
// @access  Public
router.post('/generate-all', async (req, res) => {
  try {
    // Generate forecasts for all locations using the forecasting service
    const forecasts = await forecastService.runDailyForecastGeneration();

    res.json({
      success: true,
      message: `Generated forecasts for all locations`,
      count: forecasts.length,
      locationsCount: forecasts.length / 3, // 3 days per location
      data: forecasts
    });
  } catch (error) {
    console.error('Error generating all forecasts:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating forecasts for all locations',
      error: error.message
    });
  }
});

// @route   GET /api/forecasts/all-locations
// @desc    Get forecasts for all locations
// @access  Public
router.get('/all-locations', async (req, res) => {
  try {
    const { days = 3 } = req.query;
    
    const forecasts = await Forecast.find({
      forecastDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      }
    })
      .populate('locationId', 'name city coordinates riverKm')
      .sort({ locationId: 1, forecastDate: 1 });

    // Group forecasts by location
    const forecastsByLocation = {};
    forecasts.forEach(forecast => {
      const locationId = forecast.locationId._id.toString();
      if (!forecastsByLocation[locationId]) {
        forecastsByLocation[locationId] = {
          location: forecast.locationId,
          forecasts: []
        };
      }
      forecastsByLocation[locationId].forecasts.push(forecast);
    });

    res.json({
      success: true,
      count: Object.keys(forecastsByLocation).length,
      data: Object.values(forecastsByLocation)
    });
  } catch (error) {
    console.error('Error fetching all location forecasts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching forecasts',
      error: error.message
    });
  }
});

// Helper function to generate forecast using rule-based model
async function generateForecast(locationId, historicalData) {
  const forecastDate = new Date();
  const predictions = [];
  const forecastAlerts = [];

  // Calculate averages from historical data
  const avgDO = historicalData.reduce((sum, d) => sum + d.parameters.dissolvedOxygen.value, 0) / historicalData.length;
  const avgBOD = historicalData.reduce((sum, d) => sum + d.parameters.biochemicalOxygenDemand.value, 0) / historicalData.length;
  const avgNitrate = historicalData.reduce((sum, d) => sum + d.parameters.nitrate.value, 0) / historicalData.length;
  const avgFecalColiform = historicalData.reduce((sum, d) => sum + d.parameters.fecalColiform.value, 0) / historicalData.length;

  // Generate predictions for next 3 days
  for (let day = 1; day <= 3; day++) {
    const predictionDate = moment().add(day, 'days').toDate();
    
    // Simple trend analysis (random variation for demo)
    const variation = 0.1; // 10% variation
    const seasonalFactor = 1 + (Math.sin(moment().dayOfYear() / 365 * 2 * Math.PI) * 0.1);
    
    const predictedDO = avgDO * (1 + (Math.random() - 0.5) * variation) * seasonalFactor;
    const predictedBOD = avgBOD * (1 + (Math.random() - 0.5) * variation) * seasonalFactor;
    const predictedNitrate = avgNitrate * (1 + (Math.random() - 0.5) * variation) * seasonalFactor;
    const predictedFecalColiform = avgFecalColiform * (1 + (Math.random() - 0.5) * variation) * seasonalFactor;

    // Calculate trends
    const getTrend = (current, predicted) => {
      const change = (predicted - current) / current;
      if (change > 0.05) return 'declining'; // For pollutants, increase is declining quality
      if (change < -0.05) return 'improving';
      return 'stable';
    };

    const latest = historicalData[0];
    
    // Calculate predicted WQI (simplified)
    const predictedWQI = Math.max(0, Math.min(100, 
      100 - (predictedBOD * 5) - (predictedNitrate * 0.5) - (Math.log10(predictedFecalColiform) * 10) + (predictedDO * 10)
    ));

    const predictedStatus = getWQIStatus(predictedWQI);

    const prediction = {
      date: predictionDate,
      dayOffset: day,
      parameters: {
        dissolvedOxygen: {
          predicted: Math.round(predictedDO * 100) / 100,
          confidence: 75 + Math.random() * 20,
          trend: getTrend(latest.parameters.dissolvedOxygen.value, predictedDO)
        },
        biochemicalOxygenDemand: {
          predicted: Math.round(predictedBOD * 100) / 100,
          confidence: 75 + Math.random() * 20,
          trend: getTrend(latest.parameters.biochemicalOxygenDemand.value, predictedBOD)
        },
        nitrate: {
          predicted: Math.round(predictedNitrate * 100) / 100,
          confidence: 75 + Math.random() * 20,
          trend: getTrend(latest.parameters.nitrate.value, predictedNitrate)
        },
        fecalColiform: {
          predicted: Math.round(predictedFecalColiform),
          confidence: 70 + Math.random() * 20,
          trend: getTrend(latest.parameters.fecalColiform.value, predictedFecalColiform)
        }
      },
      predictedWQI: Math.round(predictedWQI),
      predictedStatus,
      expectedWeather: {
        rainfall: Math.random() * 10, // Random rainfall 0-10mm
        temperature: 20 + Math.random() * 15, // 20-35°C
        humidity: 60 + Math.random() * 30 // 60-90%
      }
    };

    predictions.push(prediction);

    // Check for alerts
    if (predictedBOD > 6.0) {
      forecastAlerts.push({
        day,
        parameter: 'biochemicalOxygenDemand',
        severity: 'high',
        message: `High BOD levels predicted (${prediction.parameters.biochemicalOxygenDemand.predicted} mg/L)`
      });
    }
    
    if (predictedNitrate > 45.0) {
      forecastAlerts.push({
        day,
        parameter: 'nitrate',
        severity: 'high',
        message: `High nitrate levels predicted (${prediction.parameters.nitrate.predicted} mg/L)`
      });
    }
    
    if (predictedFecalColiform > 2500) {
      forecastAlerts.push({
        day,
        parameter: 'fecalColiform',
        severity: 'high',
        message: `High fecal coliform predicted (${prediction.parameters.fecalColiform.predicted} MPN/100ml)`
      });
    }
  }

  // Create and save forecast
  const forecast = new Forecast({
    locationId,
    forecastDate,
    predictions,
    forecastAlerts,
    modelInfo: {
      algorithm: 'rule-based',
      version: '1.0',
      accuracy: 75 + Math.random() * 15
    }
  });

  await forecast.save();
  
  return await Forecast.findById(forecast._id)
    .populate('locationId', 'name city coordinates');
}

// Helper function to determine WQI status
function getWQIStatus(wqi) {
  if (wqi >= 90) return 'excellent';
  if (wqi >= 70) return 'good';
  if (wqi >= 50) return 'moderate';
  if (wqi >= 25) return 'poor';
  return 'very_poor';
}

module.exports = router;