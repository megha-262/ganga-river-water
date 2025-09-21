const WaterQuality = require('../models/WaterQuality');
const Forecast = require('../models/Forecast');
const moment = require('moment');

class ForecastService {
  constructor() {
    this.forecastHorizon = 7; // Extended to 7 days
    this.modelAccuracy = 85; // Base model accuracy
    
    // Enhanced seasonal factors with more granular effects
    this.seasonalFactors = {
      monsoon: { // June-September
        dissolvedOxygen: 0.85,
        biochemicalOxygenDemand: 1.4,
        nitrate: 1.3,
        fecalColiform: 1.8,
        ph: 0.93,
        turbidity: 2.5,
        confidence: 0.7 // Lower confidence during monsoon
      },
      winter: { // December-February
        dissolvedOxygen: 1.15,
        biochemicalOxygenDemand: 0.75,
        nitrate: 0.85,
        fecalColiform: 0.6,
        ph: 1.03,
        turbidity: 0.5,
        confidence: 0.9 // Higher confidence in winter
      },
      summer: { // March-May
        dissolvedOxygen: 0.8,
        biochemicalOxygenDemand: 1.2,
        nitrate: 1.15,
        fecalColiform: 1.3,
        ph: 0.97,
        turbidity: 1.4,
        confidence: 0.8
      },
      postMonsoon: { // October-November
        dissolvedOxygen: 1.1,
        biochemicalOxygenDemand: 0.85,
        nitrate: 0.9,
        fecalColiform: 0.75,
        ph: 1.02,
        turbidity: 0.7,
        confidence: 0.85
      }
    };
    
    // Environmental impact factors
    this.environmentalImpacts = {
      temperature: {
        dissolvedOxygen: -0.03, // DO decreases with temperature
        biochemicalOxygenDemand: 0.02, // BOD increases with temperature
        fecalColiform: 0.015 // Bacteria growth increases with temperature
      },
      rainfall: {
        dissolvedOxygen: 0.01, // Aeration increases DO
        biochemicalOxygenDemand: -0.005, // Dilution effect
        nitrate: -0.008, // Dilution effect
        fecalColiform: 0.02, // Runoff increases contamination
        turbidity: 0.05 // Runoff increases turbidity
      },
      industrialActivity: {
        biochemicalOxygenDemand: 0.3,
        nitrate: 0.25,
        ph: -0.1, // Industrial discharge affects pH
        turbidity: 0.15
      }
    };
    
    // Parameter correlation matrix for cross-parameter predictions
    this.parameterCorrelations = {
      dissolvedOxygen: {
        biochemicalOxygenDemand: -0.7, // Strong negative correlation
        temperature: -0.6,
        fecalColiform: -0.5
      },
      biochemicalOxygenDemand: {
        nitrate: 0.6,
        fecalColiform: 0.7,
        turbidity: 0.5
      },
      nitrate: {
        fecalColiform: 0.4,
        ph: -0.3
      }
    };
  }

  // Get current season based on month
  getCurrentSeason(date = new Date()) {
    const month = date.getMonth() + 1; // 1-12
    if (month >= 6 && month <= 9) return 'monsoon';
    if (month >= 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'summer';
    return 'postMonsoon';
  }

  // Enhanced trend calculation with multiple methods
  calculateTrend(historicalData, parameter) {
    if (historicalData.length < 5) return { linear: 0, exponential: 0, confidence: 0 };

    const values = historicalData.map(d => d.parameters[parameter]?.value || 0);
    const timestamps = historicalData.map(d => new Date(d.timestamp).getTime());
    
    // Use more data points for better trend analysis
    const recentValues = values.slice(-14); // Last 14 readings
    const recentTimestamps = timestamps.slice(-14);
    
    if (recentValues.length < 3) return { linear: 0, exponential: 0, confidence: 0 };

    // Linear trend calculation (improved)
    const linearTrend = this.calculateLinearTrend(recentValues, recentTimestamps);
    
    // Exponential trend calculation for non-linear patterns
    const exponentialTrend = this.calculateExponentialTrend(recentValues);
    
    // Calculate confidence based on data consistency
    const confidence = this.calculateTrendConfidence(recentValues);
    
    return {
      linear: linearTrend,
      exponential: exponentialTrend,
      confidence: confidence
    };
  }

  // Linear trend with weighted recent values
  calculateLinearTrend(values, timestamps) {
    const n = values.length;
    if (n < 2) return 0;

    // Weight recent values more heavily
    const weights = values.map((_, i) => Math.pow(1.1, i));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      const weight = weights[i] / totalWeight;
      const x = i;
      const y = values[i];
      
      sumX += x * weight;
      sumY += y * weight;
      sumXY += x * y * weight;
      sumXX += x * x * weight;
    }

    const slope = (sumXY - sumX * sumY) / (sumXX - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  // Exponential trend for detecting accelerating changes
  calculateExponentialTrend(values) {
    if (values.length < 3) return 0;
    
    // Calculate rate of change acceleration
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i-1]);
    }
    
    if (changes.length < 2) return 0;
    
    // Calculate trend in the rate of change
    let sumChange = 0;
    for (let i = 1; i < changes.length; i++) {
      sumChange += changes[i] - changes[i-1];
    }
    
    return sumChange / (changes.length - 1);
  }

  // Calculate confidence in trend prediction
  calculateTrendConfidence(values) {
    if (values.length < 3) return 0;
    
    // Calculate variance and consistency
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower variance = higher confidence
    const varianceConfidence = Math.max(0, 1 - (stdDev / mean));
    
    // Check for consistent direction in recent changes
    const recentChanges = [];
    for (let i = Math.max(0, values.length - 5); i < values.length - 1; i++) {
      recentChanges.push(values[i + 1] - values[i]);
    }
    
    const positiveChanges = recentChanges.filter(c => c > 0).length;
    const negativeChanges = recentChanges.filter(c => c < 0).length;
    const directionConsistency = Math.abs(positiveChanges - negativeChanges) / recentChanges.length;
    
    return Math.min(1, (varianceConfidence + directionConsistency) / 2);
  }

  // Predict environmental conditions for future days
  predictEnvironmentalConditions(day, currentConditions, season) {
    const { temperature, rainfall, industrialActivity } = currentConditions || {};
    
    // Seasonal temperature variation
    let predictedTemp = temperature || 25;
    if (season === 'summer') predictedTemp += day * 0.5;
    else if (season === 'winter') predictedTemp -= day * 0.3;
    else if (season === 'monsoon') predictedTemp -= day * 0.2;
    
    // Rainfall prediction (simplified weather pattern)
    let predictedRainfall = rainfall || 0;
    if (season === 'monsoon') {
      predictedRainfall = Math.max(0, predictedRainfall + (Math.random() - 0.3) * 20);
    } else {
      predictedRainfall = Math.max(0, predictedRainfall * (1 - day * 0.1));
    }
    
    // Industrial activity (weekly patterns)
    const dayOfWeek = (new Date().getDay() + day) % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let predictedIndustrial = industrialActivity || 1.0;
    if (isWeekend) predictedIndustrial *= 0.7;
    
    return {
      temperature: Math.round(predictedTemp * 10) / 10,
      rainfall: Math.round(predictedRainfall * 10) / 10,
      industrialActivity: Math.round(predictedIndustrial * 100) / 100
    };
  }

  // Apply environmental impacts to parameter predictions
  applyEnvironmentalImpacts(baseValue, parameter, environmentalConditions, currentConditions) {
    let adjustedValue = baseValue;
    
    const impacts = this.environmentalImpacts;
    
    // Temperature impact
    if (impacts.temperature[parameter] && environmentalConditions.temperature && currentConditions.temperature) {
      const tempDiff = environmentalConditions.temperature - currentConditions.temperature;
      adjustedValue *= (1 + impacts.temperature[parameter] * tempDiff);
    }
    
    // Rainfall impact
    if (impacts.rainfall[parameter] && environmentalConditions.rainfall) {
      adjustedValue *= (1 + impacts.rainfall[parameter] * environmentalConditions.rainfall / 10);
    }
    
    // Industrial activity impact
    if (impacts.industrialActivity[parameter] && environmentalConditions.industrialActivity) {
      const industrialFactor = environmentalConditions.industrialActivity - 1;
      adjustedValue *= (1 + impacts.industrialActivity[parameter] * industrialFactor);
    }
    
    return adjustedValue;
  }

  // Apply parameter correlations for cross-parameter predictions
  applyParameterCorrelations(parameters, targetParameter, predictedValues) {
    const correlations = this.parameterCorrelations[targetParameter];
    if (!correlations) return predictedValues[targetParameter];
    
    let correlationAdjustment = 0;
    let totalWeight = 0;
    
    Object.keys(correlations).forEach(sourceParam => {
      if (predictedValues[sourceParam] && parameters[sourceParam]) {
        const correlation = correlations[sourceParam];
        const sourceChange = (predictedValues[sourceParam] - parameters[sourceParam].value) / parameters[sourceParam].value;
        correlationAdjustment += correlation * sourceChange * Math.abs(correlation);
        totalWeight += Math.abs(correlation);
      }
    });
    
    if (totalWeight > 0) {
      correlationAdjustment /= totalWeight;
      const baseValue = predictedValues[targetParameter] || parameters[targetParameter]?.value || 0;
      return baseValue * (1 + correlationAdjustment * 0.3); // 30% influence from correlations
    }
    
    return predictedValues[targetParameter];
  }

  // Apply seasonal adjustments
  applySeasonalAdjustment(value, parameter, season) {
    const factor = this.seasonalFactors[season][parameter] || 1;
    return value * factor;
  }

  // Add random variation to make forecasts more realistic
  addRandomVariation(value, variationPercent = 0.1) {
    const variation = value * variationPercent * (Math.random() - 0.5) * 2;
    return Math.max(0, value + variation);
  }

  // Apply parameter-specific bounds
  applyParameterBounds(value, parameter) {
    const bounds = {
      dissolvedOxygen: { min: 0, max: 15 },
      biochemicalOxygenDemand: { min: 0, max: 50 },
      nitrate: { min: 0, max: 200 },
      fecalColiform: { min: 0, max: 100000 },
      ph: { min: 6, max: 9 },
      turbidity: { min: 0, max: 200 },
      temperature: { min: 5, max: 45 }
    };

    const bound = bounds[parameter];
    if (bound) {
      return Math.max(bound.min, Math.min(bound.max, value));
    }
    return Math.max(0, value);
  }

  // Classify trend based on trend data and parameter type
  classifyTrend(trendData, parameter) {
    const { linear, confidence } = trendData;
    const threshold = 0.05; // Minimum significant trend
    
    if (confidence < 0.3 || Math.abs(linear) < threshold) {
      return 'stable';
    }
    
    // For parameters where lower is better
    const lowerIsBetter = ['biochemicalOxygenDemand', 'nitrate', 'fecalColiform', 'turbidity'];
    
    if (lowerIsBetter.includes(parameter)) {
      return linear < 0 ? 'improving' : 'declining';
    } else if (parameter === 'dissolvedOxygen') {
      return linear > 0 ? 'improving' : 'declining';
    } else if (parameter === 'ph') {
      // For pH, moving towards 7-8 range is improving
      return 'stable'; // pH trends are complex, keep as stable for now
    }
    
    return 'stable';
  }

  // Calculate environmental impact score
  calculateEnvironmentalImpact(parameter, predictedConditions, currentConditions) {
    let impact = 0;
    const impacts = this.environmentalImpacts;
    
    // Temperature impact
    if (impacts.temperature[parameter] && predictedConditions.temperature && currentConditions.temperature) {
      const tempDiff = predictedConditions.temperature - currentConditions.temperature;
      impact += Math.abs(impacts.temperature[parameter] * tempDiff) * 10;
    }
    
    // Rainfall impact
    if (impacts.rainfall[parameter] && predictedConditions.rainfall) {
      impact += Math.abs(impacts.rainfall[parameter] * predictedConditions.rainfall / 10) * 10;
    }
    
    // Industrial activity impact
    if (impacts.industrialActivity[parameter] && predictedConditions.industrialActivity) {
      const industrialFactor = Math.abs(predictedConditions.industrialActivity - 1);
      impact += Math.abs(impacts.industrialActivity[parameter] * industrialFactor) * 10;
    }
    
    return Math.min(100, Math.round(impact));
  }

  // Calculate alert severity
  calculateAlertSeverity(value, parameter, trendData, day) {
    const status = this.getParameterStatus(value, parameter);
    const trendStrength = Math.abs(trendData.linear);
    
    if (status === 'poor') {
      if (trendStrength > 0.2 || day <= 2) return 'high';
      if (trendStrength > 0.1 || day <= 4) return 'medium';
      return 'low';
    }
    
    if (status === 'moderate' && trendStrength > 0.15) {
      return 'medium';
    }
    
    return 'low';
  }

  // Generate detailed alert message
  generateAlertMessage(parameter, value, status, day) {
    const parameterNames = {
      dissolvedOxygen: 'Dissolved Oxygen',
      biochemicalOxygenDemand: 'Biochemical Oxygen Demand',
      nitrate: 'Nitrate',
      fecalColiform: 'Fecal Coliform',
      ph: 'pH',
      turbidity: 'Turbidity'
    };
    
    const name = parameterNames[parameter] || parameter;
    const roundedValue = Math.round(value * 100) / 100;
    
    if (status === 'poor') {
      return `${name} predicted to reach critical levels (${roundedValue}) on day ${day}. Immediate attention required.`;
    } else if (status === 'moderate') {
      return `${name} predicted to be at moderate risk levels (${roundedValue}) on day ${day}. Monitor closely.`;
    }
    
    return `${name} levels may require attention (${roundedValue}) on day ${day}.`;
  }

  // Get recommended action for alerts
  getRecommendedAction(parameter, status, trend) {
    const actions = {
      dissolvedOxygen: {
        poor: 'Increase aeration, reduce organic load, check for pollution sources',
        moderate: 'Monitor oxygen levels, consider aeration if trend continues'
      },
      biochemicalOxygenDemand: {
        poor: 'Identify and control organic pollution sources, improve wastewater treatment',
        moderate: 'Monitor organic load, check upstream activities'
      },
      nitrate: {
        poor: 'Control agricultural runoff, improve sewage treatment, reduce fertilizer use',
        moderate: 'Monitor nutrient levels, check for agricultural activities'
      },
      fecalColiform: {
        poor: 'Immediate water treatment required, identify contamination source, restrict water use',
        moderate: 'Increase monitoring frequency, check sewage systems'
      },
      ph: {
        poor: 'Identify acid/alkaline sources, neutralize if possible, monitor industrial discharge',
        moderate: 'Monitor pH levels, check for industrial activities'
      },
      turbidity: {
        poor: 'Control erosion, improve sedimentation, check construction activities',
        moderate: 'Monitor sediment levels, check upstream activities'
      }
    };
    
    const paramActions = actions[parameter];
    if (paramActions) {
      return paramActions[status] || 'Continue monitoring and assess trends';
    }
    
    return 'Continue monitoring and assess trends';
  }

  // Determine parameter status based on value
  getParameterStatus(value, parameter) {
    const thresholds = {
      dissolvedOxygen: { good: [6, 20], moderate: [4, 6], poor: [0, 4] },
      biochemicalOxygenDemand: { good: [0, 3], moderate: [3, 6], poor: [6, 50] },
      nitrate: { good: [0, 2], moderate: [2, 4], poor: [4, 100] },
      fecalColiform: { good: [0, 1000], moderate: [1000, 2500], poor: [2500, Infinity] },
      ph: { good: [7, 8], moderate: [6.5, 8.5], poor: [0, 14] },
      turbidity: { good: [0, 10], moderate: [10, 20], poor: [20, Infinity] }
    };

    const thresh = thresholds[parameter];
    if (!thresh) return 'good';

    if (parameter === 'ph') {
      if (value >= thresh.good[0] && value <= thresh.good[1]) return 'good';
      if (value >= thresh.moderate[0] && value <= thresh.moderate[1]) return 'moderate';
      return 'poor';
    } else {
      if (value >= thresh.good[0] && value <= thresh.good[1]) return 'good';
      if (value >= thresh.moderate[0] && value <= thresh.moderate[1]) return 'moderate';
      return 'poor';
    }
  }

  // Calculate Water Quality Index
  calculateWQI(parameters) {
    const weights = {
      dissolvedOxygen: 0.2,
      biochemicalOxygenDemand: 0.2,
      nitrate: 0.15,
      fecalColiform: 0.2,
      ph: 0.15,
      turbidity: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach(param => {
      if (parameters[param]) {
        const status = parameters[param].status;
        let score = 0;
        if (status === 'good') score = 85;
        else if (status === 'moderate') score = 60;
        else score = 30;

        totalScore += score * weights[param];
        totalWeight += weights[param];
      }
    });

    return Math.round(totalScore / totalWeight);
  }

  // Generate forecast for a single location
  async generateLocationForecast(locationId) {
    try {
      // Get historical data (last 20 days for better analysis)
      const historicalData = await WaterQuality.find({
        locationId: locationId
      })
      .sort({ timestamp: -1 })
      .limit(80); // 20 days * 4 readings per day

      if (historicalData.length === 0) {
        throw new Error('No historical data available for forecasting');
      }

      const location = await require('../models/Location').findById(locationId);
      if (!location) {
        throw new Error('Location not found');
      }

      const currentSeason = this.getCurrentSeason();
      const seasonalConfidence = this.seasonalFactors[currentSeason].confidence;
      const predictions = [];
      const forecastAlerts = [];

      // Get the latest reading as baseline
      const latestReading = historicalData[0];
      const currentEnvironmentalConditions = latestReading.environmentalConditions || {};
      
      // Generate forecasts for extended horizon
      for (let day = 1; day <= this.forecastHorizon; day++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + day);

        // Predict environmental conditions for this day
        const predictedEnvironmental = this.predictEnvironmentalConditions(
          day, 
          currentEnvironmentalConditions, 
          currentSeason
        );

        const parameters = {};
        const predictedValues = {};
        const parameterNames = ['dissolvedOxygen', 'biochemicalOxygenDemand', 'nitrate', 'fecalColiform', 'ph', 'turbidity'];

        // First pass: calculate base predictions
        parameterNames.forEach(param => {
          if (latestReading.parameters[param]) {
            // Enhanced trend calculation
            const trendData = this.calculateTrend(historicalData, param);
            
            // Combine linear and exponential trends based on confidence
            const combinedTrend = trendData.confidence > 0.7 ? 
              trendData.linear * 0.7 + trendData.exponential * 0.3 :
              trendData.linear;
            
            // Apply trend to current value
            let forecastValue = latestReading.parameters[param].value + (combinedTrend * day);
            
            // Apply seasonal adjustment
            forecastValue = this.applySeasonalAdjustment(forecastValue, param, currentSeason);
            
            // Apply environmental impacts
            forecastValue = this.applyEnvironmentalImpacts(
              forecastValue, 
              param, 
              predictedEnvironmental, 
              currentEnvironmentalConditions
            );
            
            predictedValues[param] = forecastValue;
          }
        });

        // Second pass: apply parameter correlations
        parameterNames.forEach(param => {
          if (latestReading.parameters[param]) {
            let forecastValue = this.applyParameterCorrelations(
              latestReading.parameters, 
              param, 
              predictedValues
            );
            
            // Add controlled random variation
            const variationFactor = Math.max(0.05, 0.12 - (day * 0.01)); // Less variation for distant predictions
            forecastValue = this.addRandomVariation(forecastValue, variationFactor);
            
            // Ensure realistic bounds with parameter-specific constraints
            forecastValue = this.applyParameterBounds(forecastValue, param);

            // Calculate confidence with multiple factors
            const baseConfidence = Math.max(50, 95 - (day * 8)); // Base confidence decreases over time
            const trendData = this.calculateTrend(historicalData, param);
            const trendConfidence = trendData.confidence * 100;
            const seasonalConfidenceBonus = seasonalConfidence * 10;
            
            const finalConfidence = Math.min(95, Math.max(40, 
              baseConfidence * 0.6 + 
              trendConfidence * 0.3 + 
              seasonalConfidenceBonus * 0.1
            ));

            // Enhanced trend classification
            const trendEnum = this.classifyTrend(trendData, param);

            parameters[param] = {
              predicted: Number(forecastValue.toFixed(2)),
              confidence: Math.round(finalConfidence),
              trend: trendEnum,
              trendStrength: Math.abs(trendData.linear),
              environmentalImpact: this.calculateEnvironmentalImpact(param, predictedEnvironmental, currentEnvironmentalConditions)
            };

            // Enhanced alert detection
            const status = this.getParameterStatus(forecastValue, param);
            const alertSeverity = this.calculateAlertSeverity(forecastValue, param, trendData, day);
            
            if (status === 'poor' || alertSeverity === 'high') {
              forecastAlerts.push({
                day: day,
                parameter: param,
                severity: alertSeverity,
                message: this.generateAlertMessage(param, forecastValue, status, day),
                confidence: finalConfidence,
                recommendedAction: this.getRecommendedAction(param, status, trendEnum)
              });
            }
          }
        });

        // Calculate forecast WQI and overall status
        const wqi = this.calculateWQI({
          dissolvedOxygen: { value: parameters.dissolvedOxygen?.predicted, status: this.getParameterStatus(parameters.dissolvedOxygen?.predicted || 0, 'dissolvedOxygen') },
          biochemicalOxygenDemand: { value: parameters.biochemicalOxygenDemand?.predicted, status: this.getParameterStatus(parameters.biochemicalOxygenDemand?.predicted || 0, 'biochemicalOxygenDemand') },
          nitrate: { value: parameters.nitrate?.predicted, status: this.getParameterStatus(parameters.nitrate?.predicted || 0, 'nitrate') },
          fecalColiform: { value: parameters.fecalColiform?.predicted, status: this.getParameterStatus(parameters.fecalColiform?.predicted || 0, 'fecalColiform') },
          ph: { value: parameters.ph?.predicted, status: this.getParameterStatus(parameters.ph?.predicted || 7, 'ph') },
          turbidity: { value: parameters.turbidity?.predicted, status: this.getParameterStatus(parameters.turbidity?.predicted || 0, 'turbidity') }
        });
        
        let predictedStatus = 'excellent';
        if (wqi < 25) predictedStatus = 'very_poor';
        else if (wqi < 50) predictedStatus = 'poor';
        else if (wqi < 70) predictedStatus = 'moderate';
        else if (wqi < 90) predictedStatus = 'good';

        // Add temperature forecast
        let expectedWeather = {};
        if (latestReading.parameters.temperature) {
          const tempVariation = (Math.random() - 0.5) * 4; // ±2°C variation
          const forecastTemp = latestReading.parameters.temperature.value + tempVariation;
          expectedWeather.temperature = Number(forecastTemp.toFixed(1));
        }

        predictions.push({
          date: forecastDate,
          dayOffset: day,
          parameters: parameters,
          predictedWQI: Math.round(wqi),
          predictedStatus: predictedStatus,
          expectedWeather: expectedWeather
        });
      }

      // Create single forecast document with all predictions
      const forecast = {
        locationId: locationId,
        forecastDate: new Date(),
        predictions: predictions,
        modelInfo: {
          algorithm: 'rule-based',
          version: '1.0',
          accuracy: 75
        },
        forecastAlerts: forecastAlerts
      };

      return forecast;
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    }
  }

  // Generate forecasts for all locations
  async generateAllForecasts() {
    try {
      const Location = require('../models/Location');
      const locations = await Location.find({ isActive: true });
      
      const allForecasts = [];
      
      for (const location of locations) {
        try {
          const locationForecast = await this.generateLocationForecast(location._id);
          allForecasts.push(locationForecast);
        } catch (error) {
          console.error(`Error generating forecast for ${location.name}:`, error.message);
        }
      }

      return allForecasts;
    } catch (error) {
      console.error('Error generating all forecasts:', error);
      throw error;
    }
  }

  // Save forecasts to database
  async saveForecastsToDatabase(forecasts) {
    try {
      // Clear existing forecasts for the same locations
      const locationIds = forecasts.map(f => f.locationId);
      await Forecast.deleteMany({
        locationId: { $in: locationIds },
        forecastDate: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today's forecasts
        }
      });

      // Insert new forecasts
      const savedForecasts = await Forecast.insertMany(forecasts);
      console.log(`✅ Saved ${savedForecasts.length} forecasts to database`);
      
      return savedForecasts;
    } catch (error) {
      console.error('Error saving forecasts:', error);
      throw error;
    }
  }

  // Get forecasts for a specific location
  async getForecastsForLocation(locationId, days = 3) {
    try {
      const forecasts = await Forecast.find({
        locationId: locationId,
        forecastDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        }
      }).sort({ forecastDate: 1 });

      return forecasts;
    } catch (error) {
      console.error('Error getting forecasts:', error);
      throw error;
    }
  }

  // Run daily forecast generation
  async runDailyForecastGeneration() {
    try {
      console.log('🔮 Starting daily forecast generation...');
      
      const forecasts = await this.generateAllForecasts();
      await this.saveForecastsToDatabase(forecasts);
      
      console.log(`🎯 Generated forecasts for ${forecasts.length / 3} locations`);
      
      return forecasts;
    } catch (error) {
      console.error('Error in daily forecast generation:', error);
      throw error;
    }
  }
}

module.exports = new ForecastService();