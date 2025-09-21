const express = require('express');
const router = express.Router();

// Import route modules
const locationsRoutes = require('./locations');
const waterQualityRoutes = require('./waterQuality');
const forecastsRoutes = require('./forecasts');
const alertsRoutes = require('./alerts');
const sensorDataRoutes = require('./sensorData');
const chatbotRoutes = require('./chatbot');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ganga Water Quality Monitoring API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      locations: '/api/locations',
      waterQuality: '/api/water-quality',
      forecasts: '/api/forecasts',
      alerts: '/api/alerts',
      chatbot: '/api/chatbot'
    }
  });
});

// API status endpoint with database connection check
router.get('/status', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      success: true,
      api: 'online',
      database: statusMap[dbStatus] || 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking system status',
      error: error.message
    });
  }
});

// Use route modules
router.use('/locations', locationsRoutes);
router.use('/water-quality', waterQualityRoutes);
router.use('/forecasts', forecastsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/sensorData', sensorDataRoutes);
router.use('/chatbot', chatbotRoutes);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    title: 'Ganga Water Quality Monitoring API Documentation',
    version: '1.0.0',
    description: 'REST API for monitoring and forecasting water quality in the Ganga River',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      locations: {
        'GET /locations': 'Get all monitoring locations',
        'GET /locations/:id': 'Get specific location',
        'GET /locations/nearby': 'Find nearby locations',
        'POST /locations': 'Create new location',
        'PUT /locations/:id': 'Update location',
        'DELETE /locations/:id': 'Delete location'
      },
      waterQuality: {
        'GET /water-quality': 'Get water quality data with filters',
        'GET /water-quality/latest': 'Get latest readings for all locations',
        'GET /water-quality/location/:locationId': 'Get data for specific location',
        'GET /water-quality/trends': 'Get trend analysis',
        'GET /water-quality/alerts': 'Get current alerts',
        'POST /water-quality': 'Add new water quality measurement'
      },
      forecasts: {
        'GET /forecasts': 'Get all forecasts',
        'GET /forecasts/latest': 'Get latest forecasts',
        'GET /forecasts/all-locations': 'Get forecasts for all locations',
        'POST /forecasts/generate': 'Generate new forecasts'
      },
      alerts: {
        'GET /alerts': 'Get all current alerts',
        'GET /alerts/summary': 'Get alerts summary',
        'GET /alerts/location/:locationId': 'Get alerts for location',
        'GET /alerts/parameters/:parameter': 'Get alerts for parameter'
      }
    },
    parameters: {
      waterQuality: [
        'dissolvedOxygen (mg/L)',
        'biochemicalOxygenDemand (mg/L)',
        'nitrate (mg/L)',
        'fecalColiform (MPN/100ml)',
        'ph',
        'turbidity (NTU)'
      ],
      statuses: ['excellent', 'good', 'fair', 'poor'],
      alertSeverities: ['low', 'medium', 'high']
    },
    examples: {
      'Get latest water quality': `${req.protocol}://${req.get('host')}/api/water-quality/latest`,
      'Get location data': `${req.protocol}://${req.get('host')}/api/locations`,
      'Get current alerts': `${req.protocol}://${req.get('host')}/api/alerts`,
      'Get 3-day forecast': `${req.protocol}://${req.get('host')}/api/forecasts/latest`
    }
  });
});

module.exports = router;