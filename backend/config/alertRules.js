/**
 * Alert Rules Configuration
 * Defines 5-level alert system with thresholds and color coding
 */

const ALERT_LEVELS = {
  1: {
    name: 'NORMAL',
    label: 'Normal',
    color: '#10B981', // Green
    bgColor: '#ECFDF5',
    description: 'Water quality is within acceptable limits'
  },
  2: {
    name: 'ADVISORY',
    label: 'Advisory',
    color: '#F59E0B', // Yellow
    bgColor: '#FFFBEB',
    description: 'Minor deviation from normal parameters'
  },
  3: {
    name: 'WARNING',
    label: 'Warning',
    color: '#F97316', // Orange
    bgColor: '#FFF7ED',
    description: 'Moderate concern requiring attention'
  },
  4: {
    name: 'CRITICAL',
    label: 'Critical',
    color: '#EF4444', // Red
    bgColor: '#FEF2F2',
    description: 'Serious water quality issue requiring immediate action'
  },
  5: {
    name: 'EMERGENCY',
    label: 'Emergency',
    color: '#991B1B', // Dark Red
    bgColor: '#FEE2E2',
    description: 'Severe contamination posing immediate health risks'
  }
};

const PARAMETER_THRESHOLDS = {
  ph: {
    parameter: 'pH',
    unit: '',
    optimal: { min: 6.5, max: 8.5 },
    thresholds: {
      1: { min: 6.5, max: 8.5 }, // Normal
      2: { min: 6.0, max: 9.0 }, // Advisory
      3: { min: 5.5, max: 9.5 }, // Warning
      4: { min: 4.5, max: 10.5 }, // Critical
      5: { min: 0, max: 14 } // Emergency (outside 4.5-10.5)
    }
  },
  dissolvedOxygen: {
    parameter: 'Dissolved Oxygen',
    unit: 'mg/L',
    optimal: { min: 6, max: 14 },
    thresholds: {
      1: { min: 6, max: 14 }, // Normal
      2: { min: 4, max: 6 }, // Advisory
      3: { min: 2, max: 4 }, // Warning
      4: { min: 1, max: 2 }, // Critical
      5: { min: 0, max: 1 } // Emergency
    }
  },
  turbidity: {
    parameter: 'Turbidity',
    unit: 'NTU',
    optimal: { min: 0, max: 5 },
    thresholds: {
      1: { min: 0, max: 5 }, // Normal
      2: { min: 5, max: 25 }, // Advisory
      3: { min: 25, max: 50 }, // Warning
      4: { min: 50, max: 100 }, // Critical
      5: { min: 100, max: 1000 } // Emergency
    }
  },
  temperature: {
    parameter: 'Temperature',
    unit: '°C',
    optimal: { min: 15, max: 30 },
    thresholds: {
      1: { min: 15, max: 30 }, // Normal
      2: { min: 10, max: 35 }, // Advisory
      3: { min: 5, max: 40 }, // Warning
      4: { min: 0, max: 45 }, // Critical
      5: { min: -10, max: 60 } // Emergency
    }
  },
  conductivity: {
    parameter: 'Conductivity',
    unit: 'μS/cm',
    optimal: { min: 50, max: 1500 },
    thresholds: {
      1: { min: 50, max: 1500 }, // Normal
      2: { min: 30, max: 2500 }, // Advisory
      3: { min: 10, max: 4000 }, // Warning
      4: { min: 5, max: 6000 }, // Critical
      5: { min: 0, max: 10000 } // Emergency
    }
  },
  totalDissolvedSolids: {
    parameter: 'Total Dissolved Solids',
    unit: 'mg/L',
    optimal: { min: 0, max: 500 },
    thresholds: {
      1: { min: 0, max: 500 }, // Normal
      2: { min: 500, max: 1000 }, // Advisory
      3: { min: 1000, max: 2000 }, // Warning
      4: { min: 2000, max: 3000 }, // Critical
      5: { min: 3000, max: 10000 } // Emergency
    }
  },
  biochemicalOxygenDemand: {
    parameter: 'Biochemical Oxygen Demand',
    unit: 'mg/L',
    optimal: { min: 0, max: 3 },
    thresholds: {
      1: { min: 0, max: 3 }, // Normal
      2: { min: 3, max: 6 }, // Advisory
      3: { min: 6, max: 12 }, // Warning
      4: { min: 12, max: 25 }, // Critical
      5: { min: 25, max: 100 } // Emergency
    }
  },
  chemicalOxygenDemand: {
    parameter: 'Chemical Oxygen Demand',
    unit: 'mg/L',
    optimal: { min: 0, max: 10 },
    thresholds: {
      1: { min: 0, max: 10 }, // Normal
      2: { min: 10, max: 25 }, // Advisory
      3: { min: 25, max: 50 }, // Warning
      4: { min: 50, max: 100 }, // Critical
      5: { min: 100, max: 500 } // Emergency
    }
  },
  nitrates: {
    parameter: 'Nitrates',
    unit: 'mg/L',
    optimal: { min: 0, max: 10 },
    thresholds: {
      1: { min: 0, max: 10 }, // Normal
      2: { min: 10, max: 25 }, // Advisory
      3: { min: 25, max: 50 }, // Warning
      4: { min: 50, max: 100 }, // Critical
      5: { min: 100, max: 500 } // Emergency
    }
  },
  phosphates: {
    parameter: 'Phosphates',
    unit: 'mg/L',
    optimal: { min: 0, max: 0.1 },
    thresholds: {
      1: { min: 0, max: 0.1 }, // Normal
      2: { min: 0.1, max: 0.5 }, // Advisory
      3: { min: 0.5, max: 1.0 }, // Warning
      4: { min: 1.0, max: 2.0 }, // Critical
      5: { min: 2.0, max: 10 } // Emergency
    }
  }
};

/**
 * Evaluates water quality data against alert rules
 * @param {Object} waterQualityData - Water quality measurements
 * @returns {Object} Alert evaluation result
 */
function evaluateWaterQuality(waterQualityData) {
  const alerts = [];
  let maxLevel = 1;
  let overallStatus = 'NORMAL';

  // Check each parameter against thresholds
  Object.keys(PARAMETER_THRESHOLDS).forEach(paramKey => {
    const paramConfig = PARAMETER_THRESHOLDS[paramKey];
    const value = waterQualityData[paramKey];

    if (value !== undefined && value !== null) {
      const alertLevel = determineAlertLevel(paramKey, value);
      
      if (alertLevel > 1) {
        alerts.push({
          parameter: paramConfig.parameter,
          parameterKey: paramKey,
          value: value,
          unit: paramConfig.unit,
          level: alertLevel,
          levelInfo: ALERT_LEVELS[alertLevel],
          threshold: paramConfig.thresholds[alertLevel],
          optimal: paramConfig.optimal
        });
      }

      if (alertLevel > maxLevel) {
        maxLevel = alertLevel;
        overallStatus = ALERT_LEVELS[alertLevel].name;
      }
    }
  });

  return {
    overallLevel: maxLevel,
    overallStatus,
    overallInfo: ALERT_LEVELS[maxLevel],
    alerts,
    totalAlerts: alerts.length,
    timestamp: new Date()
  };
}

/**
 * Determines alert level for a specific parameter value
 * @param {string} paramKey - Parameter key
 * @param {number} value - Parameter value
 * @returns {number} Alert level (1-5)
 */
function determineAlertLevel(paramKey, value) {
  const paramConfig = PARAMETER_THRESHOLDS[paramKey];
  if (!paramConfig) return 1;

  // Check from highest level to lowest
  for (let level = 5; level >= 1; level--) {
    const threshold = paramConfig.thresholds[level];
    
    // Special handling for parameters where higher values are worse
    if (['turbidity', 'totalDissolvedSolids', 'biochemicalOxygenDemand', 'chemicalOxygenDemand', 'nitrates', 'phosphates'].includes(paramKey)) {
      if (value >= threshold.min && value <= threshold.max) {
        return level;
      }
    }
    // Special handling for dissolved oxygen (lower is worse)
    else if (paramKey === 'dissolvedOxygen') {
      if (value >= threshold.min && value <= threshold.max) {
        return level;
      }
    }
    // pH and other parameters (outside range is worse)
    else {
      if (value >= threshold.min && value <= threshold.max) {
        return level;
      }
    }
  }

  return 5; // If no threshold matches, it's emergency level
}

/**
 * Gets color information for alert level
 * @param {number} level - Alert level (1-5)
 * @returns {Object} Color information
 */
function getAlertColors(level) {
  return ALERT_LEVELS[level] || ALERT_LEVELS[1];
}

/**
 * Generates alert message based on evaluation
 * @param {Object} evaluation - Alert evaluation result
 * @param {string} locationName - Location name
 * @returns {Object} Alert message object
 */
function generateAlertMessage(evaluation, locationName) {
  if (evaluation.overallLevel === 1) {
    return {
      title: `Water Quality Normal - ${locationName}`,
      message: 'All water quality parameters are within acceptable limits.',
      type: 'system'
    };
  }

  const criticalAlerts = evaluation.alerts.filter(alert => alert.level >= 4);
  const warningAlerts = evaluation.alerts.filter(alert => alert.level === 3);
  
  let title = `${evaluation.overallInfo.label} Alert - ${locationName}`;
  let message = `Water quality monitoring detected ${evaluation.totalAlerts} parameter(s) outside normal ranges. `;
  
  if (criticalAlerts.length > 0) {
    message += `Critical issues: ${criticalAlerts.map(a => a.parameter).join(', ')}. `;
  }
  
  if (warningAlerts.length > 0) {
    message += `Warning levels: ${warningAlerts.map(a => a.parameter).join(', ')}. `;
  }
  
  message += `Immediate attention required for ${evaluation.overallInfo.label.toLowerCase()} level conditions.`;

  return {
    title,
    message,
    type: getAlertType(evaluation.overallLevel)
  };
}

/**
 * Maps alert level to alert type
 * @param {number} level - Alert level
 * @returns {string} Alert type
 */
function getAlertType(level) {
  const typeMap = {
    1: 'system',
    2: 'chemical',
    3: 'pollution',
    4: 'contamination',
    5: 'biological'
  };
  return typeMap[level] || 'system';
}

module.exports = {
  ALERT_LEVELS,
  PARAMETER_THRESHOLDS,
  evaluateWaterQuality,
  determineAlertLevel,
  getAlertColors,
  generateAlertMessage,
  getAlertType
};