const WaterQuality = require('../models/WaterQuality');
const Forecast = require('../models/Forecast');

class ForecastService {
  constructor() {
    this.forecastHorizon = 3; // 3 days
    this.seasonalFactors = {
      monsoon: { // June-September
        dissolvedOxygen: 0.9,
        biochemicalOxygenDemand: 1.3,
        nitrate: 1.2,
        fecalColiform: 1.5,
        ph: 0.95,
        turbidity: 2.0
      },
      winter: { // December-February
        dissolvedOxygen: 1.1,
        biochemicalOxygenDemand: 0.8,
        nitrate: 0.9,
        fecalColiform: 0.7,
        ph: 1.02,
        turbidity: 0.6
      },
      summer: { // March-May
        dissolvedOxygen: 0.85,
        biochemicalOxygenDemand: 1.1,
        nitrate: 1.1,
        fecalColiform: 1.2,
        ph: 0.98,
        turbidity: 1.3
      },
      postMonsoon: { // October-November
        dissolvedOxygen: 1.05,
        biochemicalOxygenDemand: 0.9,
        nitrate: 0.95,
        fecalColiform: 0.8,
        ph: 1.01,
        turbidity: 0.8
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

  // Calculate trend from historical data
  calculateTrend(historicalData, parameter) {
    if (historicalData.length < 3) return 0;

    const values = historicalData.map(d => d.parameters[parameter]?.value || 0);
    const recentValues = values.slice(-7); // Last 7 days
    
    if (recentValues.length < 2) return 0;

    // Simple linear trend calculation
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = recentValues.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += recentValues[i];
      sumXY += i * recentValues[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
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
      // Get historical data (last 10 days)
      const historicalData = await WaterQuality.find({
        locationId: locationId
      })
      .sort({ timestamp: -1 })
      .limit(40); // 10 days * 4 readings per day

      if (historicalData.length === 0) {
        throw new Error('No historical data available for forecasting');
      }

      const location = await require('../models/Location').findById(locationId);
      if (!location) {
        throw new Error('Location not found');
      }

      const currentSeason = this.getCurrentSeason();
      const predictions = [];
      const forecastAlerts = [];

      // Get the latest reading as baseline
      const latestReading = historicalData[0];
      
      // Generate forecasts for next 3 days
      for (let day = 1; day <= this.forecastHorizon; day++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + day);

        const parameters = {};
        const parameterNames = ['dissolvedOxygen', 'biochemicalOxygenDemand', 'nitrate', 'fecalColiform', 'ph', 'turbidity'];

        parameterNames.forEach(param => {
          if (latestReading.parameters[param]) {
            // Calculate trend
            const trend = this.calculateTrend(historicalData, param);
            
            // Apply trend to current value
            let forecastValue = latestReading.parameters[param].value + (trend * day);
            
            // Apply seasonal adjustment
            forecastValue = this.applySeasonalAdjustment(forecastValue, param, currentSeason);
            
            // Add random variation
            forecastValue = this.addRandomVariation(forecastValue, 0.08);
            
            // Ensure realistic bounds
            if (param === 'ph') {
              forecastValue = Math.max(6, Math.min(9, forecastValue));
            } else if (param === 'dissolvedOxygen') {
              forecastValue = Math.max(0, Math.min(15, forecastValue));
            } else if (param === 'fecalColiform') {
              forecastValue = Math.max(0, forecastValue);
            } else {
              forecastValue = Math.max(0, forecastValue);
            }

            // Convert numeric trend to enum value
            let trendEnum = 'stable';
            if (Math.abs(trend) > 0.1) { // Significant trend threshold
              if (param === 'dissolvedOxygen') {
                // For dissolved oxygen, higher is better
                trendEnum = trend > 0 ? 'improving' : 'declining';
              } else {
                // For other parameters (BOD, nitrate, fecal coliform), lower is better
                trendEnum = trend < 0 ? 'improving' : 'declining';
              }
            }

            parameters[param] = {
              predicted: Number(forecastValue.toFixed(2)),
              confidence: Math.max(60, 90 - (day * 10)), // Decreasing confidence over time
              trend: trendEnum
            };

            // Check for alerts
            const status = this.getParameterStatus(forecastValue, param);
            if (status === 'poor') {
              forecastAlerts.push({
                day: day,
                parameter: param,
                severity: 'medium',
                message: `${param} predicted to be poor on day ${day}`
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