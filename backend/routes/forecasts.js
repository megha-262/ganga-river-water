const express = require('express');
const router = express.Router();
const Forecast = require('../models/Forecast');
const WaterQuality = require('../models/WaterQuality');
const SensorData = require('../models/SensorData'); // Import SensorData model
const Location = require('../models/Location');
const forecastService = require('../services/forecastService');
const moment = require('moment');
const axios = require('axios'); // Import axios

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

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
    const forecast = await forecastService.generateLocationForecast(locationId);
    
    // Save forecasts to database (wrap single forecast in array)
    await forecastService.saveForecastsToDatabase([forecast]);

    res.json({
      success: true,
      message: `Generated forecast for location ${locationId} successfully`,
      count: forecast.predictions.length,
      data: forecast
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

// @route   POST /api/forecasts/generate-ml/:locationId
// @desc    Generate forecast for a location using ML service
// @access  Public
router.post('/generate-ml/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { days = 5 } = req.body; // Number of days to forecast

    // 1. Fetch historical sensor data for the given location
    const historicalData = await SensorData.find({ location: locationId })
      .sort({ timestamp: 1 })
      .limit(100); // Fetch last 100 readings for ML

    if (historicalData.length === 0) {
      return res.status(404).json({ success: false, message: 'No historical data found for this location.' });
    }

    // Format data for ML service
    const formattedData = historicalData.map(data => ({
      timestamp: data.timestamp,
      bod: data.bod,
      do: data.do,
      ph: data.ph,
      nitrate: data.nitrate,
      fecalColiform: data.fecalColiform,
    }));

    // 2. Send historical data to Python ML service for prediction
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
      locationId,
      historical_data: formattedData,
      days,
    });

    const mlPredictions = mlResponse.data;

    // 3. Process ML predictions and save to database
    const newForecast = new Forecast({
      locationId,
      generatedAt: new Date(),
      predictions: [], // This will be populated from mlPredictions
      modelInfo: {
        algorithm: 'ARIMA', // Or LSTM, Prophet based on actual ML model
        version: '1.0',
        accuracy: 0.85, // Placeholder accuracy
      },
    });

    // Assuming mlPredictions contains arrays like bod_forecast, do_forecast etc.
    // We need to transform this into the structure expected by the Forecast model
    for (let i = 0; i < days; i++) {
      const predictionDate = moment().add(i + 1, 'days').toDate();
      newForecast.predictions.push({
        date: predictionDate,
        dayOffset: i + 1,
        parameters: {
          dissolvedOxygen: { predicted: mlPredictions.do_forecast ? mlPredictions.do_forecast[i] : null, confidence: 80, trend: 'stable' },
          biochemicalOxygenDemand: { predicted: mlPredictions.bod_forecast ? mlPredictions.bod_forecast[i] : null, confidence: 80, trend: 'stable' },
          nitrate: { predicted: mlPredictions.nitrate_forecast ? mlPredictions.nitrate_forecast[i] : null, confidence: 80, trend: 'stable' },
          fecalColiform: { predicted: mlPredictions.fecalColiform_forecast ? mlPredictions.fecalColiform_forecast[i] : null, confidence: 80, trend: 'stable' },
        },
        predictedWQI: 0, // To be calculated or predicted by ML
        predictedStatus: 'unknown', // To be determined
        expectedWeather: {},
      });
    }

    const savedForecast = await newForecast.save();

    res.json({
      success: true,
      message: 'Forecast generated using ML service',
      data: savedForecast,
    });

  } catch (error) {
    console.error('Error generating ML forecast:', error.message);
    if (error.response) {
      console.error('ML Service Response Error:', error.response.data);
      return res.status(error.response.status).json({ success: false, message: 'ML Service Error', error: error.response.data });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

module.exports = router;