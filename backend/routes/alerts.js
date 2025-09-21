const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const WaterQuality = require('../models/WaterQuality');
const Forecast = require('../models/Forecast');
const Location = require('../models/Location');
const moment = require('moment');
const alertService = require('../services/alertService');

// @route   GET /api/alerts
// @desc    Get all current alerts with 5-level system
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      level, 
      levelMin, 
      levelMax, 
      severity, 
      type, 
      locationId, 
      status = 'active',
      limit = 100,
      page = 1 
    } = req.query;
    
    // Build filters for new alert system
    const filters = {
      limit: parseInt(limit),
      page: parseInt(page)
    };
    
    if (level) filters.level = parseInt(level);
    if (levelMin && levelMax) {
      filters.levelMin = parseInt(levelMin);
      filters.levelMax = parseInt(levelMax);
    }
    if (locationId) filters.locationId = locationId;
    if (type) filters.type = type;
    
    // Get alerts using new alert service
    const alerts = await alertService.getActiveAlerts(filters);
    
    // Get alert statistics
    const statistics = await alertService.getAlertStatistics();

    res.json({
      success: true,
      count: alerts.length,
      filters: { level, levelMin, levelMax, severity, type, locationId, status },
      statistics,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/recent
// @desc    Get recent alerts for dashboard
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent alerts using alert service
    const alerts = await alertService.getActiveAlerts({ 
      limit: parseInt(limit),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    // Get alert statistics for dashboard
    const statistics = await alertService.getAlertStatistics();
    
    // Calculate quick stats
    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      critical: alerts.filter(a => a.level >= 4).length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    };

    res.json({
      success: true,
      count: alerts.length,
      stats,
      statistics,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching recent alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent alerts',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/summary
// @desc    Get alerts summary with counts by severity
// @access  Public
router.get('/summary', async (req, res) => {
  try {
    const { locationId } = req.query;
    
    // Get alerts using new alert service
    const filters = locationId ? { locationId } : {};
    const alerts = await alertService.getActiveAlerts(filters);
    const statistics = await alertService.getAlertStatistics();
    
    // Get recent alerts (last 10)
    const recentAlerts = alerts.slice(0, 10);

    // Count by level (1-5 system)
    const summary = {
      total: alerts.length,
      level1: alerts.filter(a => a.level === 1).length, // Info
      level2: alerts.filter(a => a.level === 2).length, // Low
      level3: alerts.filter(a => a.level === 3).length, // Medium
      level4: alerts.filter(a => a.level === 4).length, // High
      level5: alerts.filter(a => a.level === 5).length, // Critical
      recentAlerts: recentAlerts,
      statistics: statistics
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching alerts summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts summary',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/statistics
// @desc    Get detailed alert statistics with 5-level breakdown
// @access  Public
router.get('/statistics', async (req, res) => {
  try {
    const statistics = await alertService.getAlertStatistics();
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching alert statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert statistics',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/trends
// @desc    Get alert trends over time
// @access  Public
router.get('/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const trends = await alertService.getAlertTrends(parseInt(days));
    
    res.json({
      success: true,
      data: trends,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Error fetching alert trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert trends',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/level/:level
// @desc    Get alerts by specific level
// @access  Public
router.get('/level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const { limit = 50 } = req.query;
    
    const alerts = await alertService.getActiveAlerts({
      level: parseInt(level),
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      level: parseInt(level),
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts by level:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts by level',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/:id/resolve
// @desc    Resolve an alert
// @access  Public
router.post('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolvedBy = 'user', notes = '' } = req.body;
    
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    alert.resolve(resolvedBy, notes);
    await alert.save();
    
    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/:id/acknowledge
// @desc    Acknowledge an alert
// @access  Public
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { acknowledgedBy = 'user', notes = '' } = req.body;
    
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    alert.acknowledge(acknowledgedBy, notes);
    await alert.save();
    
    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/location/:locationId
// @desc    Get alerts for specific location
// @access  Public
router.get('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { type = 'all', days = 7 } = req.query;
    
    let alerts = [];
    
    if (type === 'all' || type === 'current') {
      const currentAlerts = await getCurrentWaterQualityAlerts(locationId);
      alerts = alerts.concat(currentAlerts.map(alert => ({ ...alert, type: 'current' })));
    }
    
    if (type === 'all' || type === 'forecast') {
      const forecastAlerts = await getForecastAlerts(locationId);
      alerts = alerts.concat(forecastAlerts.map(alert => ({ ...alert, type: 'forecast' })));
    }

    // Get historical alerts for the location
    if (type === 'all' || type === 'historical') {
      const startDate = moment().subtract(days, 'days').toDate();
      const historicalAlerts = await getHistoricalAlerts(locationId, startDate);
      alerts = alerts.concat(historicalAlerts.map(alert => ({ ...alert, type: 'historical' })));
    }

    res.json({
      success: true,
      locationId,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching location alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location alerts',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/parameters/:parameter
// @desc    Get alerts for specific parameter across all locations
// @access  Public
router.get('/parameters/:parameter', async (req, res) => {
  try {
    const { parameter } = req.params;
    const validParameters = ['dissolvedOxygen', 'biochemicalOxygenDemand', 'nitrate', 'fecalColiform', 'ph', 'turbidity'];
    
    if (!validParameters.includes(parameter)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameter',
        validParameters
      });
    }

    const alerts = await getParameterAlerts(parameter);

    res.json({
      success: true,
      parameter,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching parameter alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parameter alerts',
      error: error.message
    });
  }
});

// Helper function to get current water quality alerts
async function getCurrentWaterQualityAlerts(locationId = null, severity = null) {
  try {
    let locationQuery = {};
    if (locationId) {
      locationQuery._id = locationId;
    }

    const locations = await Location.find({ ...locationQuery, isActive: true });
    const alerts = [];

    for (const location of locations) {
      const latest = await WaterQuality.findOne({ locationId: location._id })
        .sort({ timestamp: -1 })
        .populate('locationId', 'name city coordinates');
      
      if (latest && latest.hasAlerts()) {
        const params = latest.parameters;
        
        Object.keys(params).forEach(paramKey => {
          if (params[paramKey].status === 'poor') {
            const alertSeverity = getAlertSeverity(paramKey, params[paramKey].value);
            
            if (!severity || alertSeverity === severity) {
              alerts.push({
                id: `${latest._id}_${paramKey}`,
                location: latest.locationId,
                timestamp: latest.timestamp,
                parameter: paramKey,
                value: params[paramKey].value,
                unit: params[paramKey].unit,
                status: params[paramKey].status,
                severity: alertSeverity,
                message: generateAlertMessage(paramKey, params[paramKey].value, params[paramKey].unit, latest.locationId.name),
                waterQualityIndex: latest.waterQualityIndex,
                overallStatus: latest.overallStatus
              });
            }
          }
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error getting current water quality alerts:', error);
    return [];
  }
}

// Helper function to get forecast alerts
async function getForecastAlerts(locationId = null, severity = null) {
  try {
    let query = {};
    if (locationId) {
      query.locationId = locationId;
    }

    const forecasts = await Forecast.find(query)
      .populate('locationId', 'name city coordinates')
      .sort({ generatedAt: -1 })
      .limit(locationId ? 1 : 10); // Get latest for each location or specific location

    const alerts = [];

    forecasts.forEach(forecast => {
      forecast.forecastAlerts.forEach(alert => {
        if (!severity || alert.severity === severity) {
          alerts.push({
            id: `${forecast._id}_${alert.day}_${alert.parameter}`,
            location: forecast.locationId,
            timestamp: forecast.generatedAt,
            forecastDay: alert.day,
            parameter: alert.parameter,
            severity: alert.severity,
            message: alert.message,
            type: 'forecast'
          });
        }
      });
    });

    return alerts;
  } catch (error) {
    console.error('Error getting forecast alerts:', error);
    return [];
  }
}

// Helper function to get historical alerts
async function getHistoricalAlerts(locationId, startDate) {
  try {
    const historicalData = await WaterQuality.find({
      locationId,
      timestamp: { $gte: startDate },
      $or: [
        { 'parameters.dissolvedOxygen.status': 'poor' },
        { 'parameters.biochemicalOxygenDemand.status': 'poor' },
        { 'parameters.nitrate.status': 'poor' },
        { 'parameters.fecalColiform.status': 'poor' },
        { 'parameters.ph.status': 'poor' },
        { 'parameters.turbidity.status': 'poor' }
      ]
    })
    .populate('locationId', 'name city coordinates')
    .sort({ timestamp: -1 });

    const alerts = [];

    historicalData.forEach(data => {
      const params = data.parameters;
      Object.keys(params).forEach(paramKey => {
        if (params[paramKey].status === 'poor') {
          alerts.push({
            id: `${data._id}_${paramKey}`,
            location: data.locationId,
            timestamp: data.timestamp,
            parameter: paramKey,
            value: params[paramKey].value,
            unit: params[paramKey].unit,
            severity: getAlertSeverity(paramKey, params[paramKey].value),
            message: generateAlertMessage(paramKey, params[paramKey].value, params[paramKey].unit, data.locationId.name)
          });
        }
      });
    });

    return alerts;
  } catch (error) {
    console.error('Error getting historical alerts:', error);
    return [];
  }
}

// Helper function to get alerts for specific parameter
async function getParameterAlerts(parameter) {
  try {
    const query = {};
    query[`parameters.${parameter}.status`] = 'poor';

    const data = await WaterQuality.find(query)
      .populate('locationId', 'name city coordinates')
      .sort({ timestamp: -1 })
      .limit(50);

    return data.map(item => ({
      id: `${item._id}_${parameter}`,
      location: item.locationId,
      timestamp: item.timestamp,
      parameter,
      value: item.parameters[parameter].value,
      unit: item.parameters[parameter].unit,
      severity: getAlertSeverity(parameter, item.parameters[parameter].value),
      message: generateAlertMessage(parameter, item.parameters[parameter].value, item.parameters[parameter].unit, item.locationId.name)
    }));
  } catch (error) {
    console.error('Error getting parameter alerts:', error);
    return [];
  }
}

// Helper function to determine alert severity
function getAlertSeverity(parameter, value) {
  const thresholds = {
    dissolvedOxygen: { high: 2, medium: 4 }, // Lower is worse for DO
    biochemicalOxygenDemand: { high: 10, medium: 6 },
    nitrate: { high: 50, medium: 45 },
    fecalColiform: { high: 5000, medium: 2500 },
    ph: { high: [5, 9], medium: [6, 8.5] }, // Outside range is worse
    turbidity: { high: 20, medium: 10 }
  };

  const threshold = thresholds[parameter];
  if (!threshold) return 'medium';

  if (parameter === 'dissolvedOxygen') {
    if (value <= threshold.high) return 'high';
    if (value <= threshold.medium) return 'medium';
    return 'low';
  } else if (parameter === 'ph') {
    if (value <= threshold.high[0] || value >= threshold.high[1]) return 'high';
    if (value <= threshold.medium[0] || value >= threshold.medium[1]) return 'medium';
    return 'low';
  } else {
    if (value >= threshold.high) return 'high';
    if (value >= threshold.medium) return 'medium';
    return 'low';
  }
}

// Helper function to generate alert messages
function generateAlertMessage(parameter, value, unit, locationName) {
  const parameterNames = {
    dissolvedOxygen: 'Dissolved Oxygen',
    biochemicalOxygenDemand: 'BOD',
    nitrate: 'Nitrate',
    fecalColiform: 'Fecal Coliform',
    ph: 'pH',
    turbidity: 'Turbidity'
  };

  const paramName = parameterNames[parameter] || parameter;
  
  if (parameter === 'dissolvedOxygen') {
    return `Low ${paramName} levels detected at ${locationName}: ${value} ${unit}`;
  } else {
    return `High ${paramName} levels detected at ${locationName}: ${value} ${unit}`;
  }
}

module.exports = router;