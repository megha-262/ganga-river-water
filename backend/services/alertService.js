const Alert = require('../models/Alert');
const Location = require('../models/Location');
const { 
  evaluateWaterQuality, 
  generateAlertMessage, 
  getAlertColors,
  ALERT_LEVELS 
} = require('../config/alertRules');

/**
 * Alert Service
 * Handles alert evaluation, creation, and management
 */
class AlertService {
  
  /**
   * Evaluates water quality data and creates alerts if necessary
   * @param {Object} waterQualityData - Water quality measurement data
   * @param {string} locationId - Location ID
   * @param {string} locationName - Location name
   * @returns {Object} Evaluation result with created alerts
   */
  async evaluateAndCreateAlerts(waterQualityData, locationId, locationName) {
    try {
      // Evaluate water quality against alert rules
      const evaluation = evaluateWaterQuality(waterQualityData);
      
      const result = {
        evaluation,
        alertsCreated: [],
        alertsUpdated: [],
        summary: {
          level: evaluation.overallLevel,
          levelName: evaluation.overallStatus,
          totalIssues: evaluation.totalAlerts,
          timestamp: evaluation.timestamp
        }
      };

      // Only create alerts if there are issues (level > 1)
      if (evaluation.overallLevel > 1) {
        const alertMessage = generateAlertMessage(evaluation, locationName);
        const levelInfo = evaluation.overallInfo;
        
        // Check if similar alert already exists and is active
        const existingAlert = await Alert.findOne({
          locationId,
          level: evaluation.overallLevel,
          status: 'active',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
        });

        if (existingAlert) {
          // Update existing alert with new data
          existingAlert.parameters = waterQualityData;
          existingAlert.message = alertMessage.message;
          existingAlert.metadata = {
            ...existingAlert.metadata,
            lastEvaluation: evaluation,
            updateCount: (existingAlert.metadata?.updateCount || 0) + 1
          };
          
          await existingAlert.save();
          result.alertsUpdated.push(existingAlert);
        } else {
          // Create new alert
          const newAlert = new Alert({
            locationId,
            locationName,
            type: alertMessage.type,
            severity: this.mapLevelToSeverity(evaluation.overallLevel),
            level: evaluation.overallLevel,
            levelName: evaluation.overallStatus,
            color: levelInfo.color,
            bgColor: levelInfo.bgColor,
            title: alertMessage.title,
            message: alertMessage.message,
            parameters: waterQualityData,
            thresholds: {
              exceeded: evaluation.alerts.map(a => a.parameter).join(', '),
              value: evaluation.alerts.length,
              limit: 0
            },
            priority: evaluation.overallLevel,
            source: 'automated',
            metadata: {
              evaluation,
              alertDetails: evaluation.alerts,
              evaluationTimestamp: evaluation.timestamp
            }
          });

          const savedAlert = await newAlert.save();
          result.alertsCreated.push(savedAlert);
        }
      } else {
        // Resolve any existing active alerts for this location if water quality is normal
        await this.resolveLocationAlerts(locationId, 'Automated resolution - water quality returned to normal');
      }

      return result;
    } catch (error) {
      console.error('Error in evaluateAndCreateAlerts:', error);
      throw error;
    }
  }

  /**
   * Resolves all active alerts for a location
   * @param {string} locationId - Location ID
   * @param {string} reason - Resolution reason
   * @returns {Array} Resolved alerts
   */
  async resolveLocationAlerts(locationId, reason = 'Manual resolution') {
    try {
      const activeAlerts = await Alert.find({
        locationId,
        status: 'active'
      });

      const resolvedAlerts = [];
      for (const alert of activeAlerts) {
        alert.resolve('system', reason);
        await alert.save();
        resolvedAlerts.push(alert);
      }

      return resolvedAlerts;
    } catch (error) {
      console.error('Error resolving location alerts:', error);
      throw error;
    }
  }

  /**
   * Gets active alerts with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Array} Filtered alerts
   */
  async getActiveAlerts(filters = {}) {
    try {
      const query = { status: 'active' };
      
      if (filters.level) {
        query.level = filters.level;
      }
      
      if (filters.levelMin && filters.levelMax) {
        query.level = { $gte: filters.levelMin, $lte: filters.levelMax };
      }
      
      if (filters.locationId) {
        query.locationId = filters.locationId;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }

      const alerts = await Alert.find(query)
        .populate('locationId', 'name coordinates')
        .sort({ level: -1, createdAt: -1 })
        .limit(filters.limit || 100);

      return alerts;
    } catch (error) {
      console.error('Error getting active alerts:', error);
      throw error;
    }
  }

  /**
   * Gets alert statistics by level
   * @returns {Object} Alert statistics
   */
  async getAlertStatistics() {
    try {
      const stats = await Alert.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$level',
            count: { $sum: 1 },
            levelName: { $first: '$levelName' },
            color: { $first: '$color' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Ensure all levels are represented
      const fullStats = [];
      for (let level = 1; level <= 5; level++) {
        const levelStat = stats.find(s => s._id === level);
        const levelInfo = ALERT_LEVELS[level];
        
        fullStats.push({
          level,
          levelName: levelInfo.name,
          label: levelInfo.label,
          count: levelStat ? levelStat.count : 0,
          color: levelInfo.color,
          bgColor: levelInfo.bgColor,
          description: levelInfo.description
        });
      }

      const totalActive = stats.reduce((sum, stat) => sum + stat.count, 0);
      const criticalCount = stats
        .filter(s => s._id >= 4)
        .reduce((sum, stat) => sum + stat.count, 0);

      return {
        byLevel: fullStats,
        summary: {
          totalActive,
          criticalCount,
          warningCount: stats.find(s => s._id === 3)?.count || 0,
          advisoryCount: stats.find(s => s._id === 2)?.count || 0,
          normalCount: stats.find(s => s._id === 1)?.count || 0
        }
      };
    } catch (error) {
      console.error('Error getting alert statistics:', error);
      throw error;
    }
  }

  /**
   * Bulk evaluates water quality for multiple locations
   * @param {Array} waterQualityDataArray - Array of water quality data with location info
   * @returns {Object} Bulk evaluation results
   */
  async bulkEvaluateAlerts(waterQualityDataArray) {
    try {
      const results = {
        processed: 0,
        alertsCreated: 0,
        alertsUpdated: 0,
        errors: []
      };

      for (const data of waterQualityDataArray) {
        try {
          const result = await this.evaluateAndCreateAlerts(
            data.waterQuality,
            data.locationId,
            data.locationName
          );
          
          results.processed++;
          results.alertsCreated += result.alertsCreated.length;
          results.alertsUpdated += result.alertsUpdated.length;
        } catch (error) {
          results.errors.push({
            locationId: data.locationId,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulk alert evaluation:', error);
      throw error;
    }
  }

  /**
   * Maps alert level to severity for backward compatibility
   * @param {number} level - Alert level (1-5)
   * @returns {string} Severity string
   */
  mapLevelToSeverity(level) {
    const severityMap = {
      1: 'low',
      2: 'low',
      3: 'medium',
      4: 'high',
      5: 'critical'
    };
    return severityMap[level] || 'medium';
  }

  /**
   * Gets recent alert trends
   * @param {number} days - Number of days to analyze
   * @returns {Object} Alert trends data
   */
  async getAlertTrends(days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Alert.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              level: '$level'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            levels: {
              $push: {
                level: '$_id.level',
                count: '$count'
              }
            },
            totalCount: { $sum: '$count' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return trends;
    } catch (error) {
      console.error('Error getting alert trends:', error);
      throw error;
    }
  }
}

module.exports = new AlertService();