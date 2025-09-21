const WaterQuality = require('../models/WaterQuality');
const Location = require('../models/Location');
const moment = require('moment');

class DataSimulationService {
  constructor() {
    this.isRunning = false;
    this.simulationInterval = null;
    this.updateInterval = 15 * 60 * 1000; // 15 minutes
    
    // Environmental factors that affect water quality
    this.environmentalFactors = {
      temperature: { min: 15, max: 35, seasonal: true },
      rainfall: { min: 0, max: 100, seasonal: true },
      industrialActivity: { min: 0.5, max: 1.5, daily: true },
      urbanRunoff: { min: 0.8, max: 1.3, daily: true }
    };
    
    // Base pollution levels by location type
    this.locationProfiles = {
      pristine: { pollutionBase: 0.1, variability: 0.2 },
      rural: { pollutionBase: 0.3, variability: 0.3 },
      urban: { pollutionBase: 0.6, variability: 0.4 },
      industrial: { pollutionBase: 0.8, variability: 0.5 }
    };
  }

  // Get current environmental conditions
  getCurrentEnvironmentalFactors() {
    const now = moment();
    const hour = now.hour();
    const dayOfYear = now.dayOfYear();
    const month = now.month();
    
    // Temperature varies by season and time of day
    const seasonalTemp = 25 + 10 * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI/2);
    const dailyTempVariation = 5 * Math.sin((hour / 24) * 2 * Math.PI - Math.PI/2);
    const temperature = seasonalTemp + dailyTempVariation + (Math.random() - 0.5) * 4;
    
    // Rainfall varies by season (monsoon simulation)
    const isMonsoon = month >= 6 && month <= 9;
    const rainfall = isMonsoon ? 
      Math.random() * 50 + 20 : // 20-70mm during monsoon
      Math.random() * 10; // 0-10mm otherwise
    
    // Industrial activity peaks during business hours
    const industrialActivity = hour >= 8 && hour <= 18 ? 
      1.2 + Math.random() * 0.3 : 
      0.6 + Math.random() * 0.4;
    
    // Urban runoff increases with rainfall and morning/evening traffic
    const trafficFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.3 : 1.0;
    const urbanRunoff = (1 + rainfall / 100) * trafficFactor * (0.8 + Math.random() * 0.4);
    
    return {
      temperature: Math.round(temperature * 10) / 10,
      rainfall: Math.round(rainfall * 10) / 10,
      industrialActivity: Math.round(industrialActivity * 100) / 100,
      urbanRunoff: Math.round(urbanRunoff * 100) / 100,
      hour,
      isMonsoon
    };
  }

  // Determine location profile based on river km and name
  getLocationProfile(location) {
    const { name, riverKm } = location;
    
    // Classify based on known pollution patterns
    if (name.toLowerCase().includes('haridwar') || riverKm < 500) {
      return 'rural';
    } else if (name.toLowerCase().includes('kanpur') || name.toLowerCase().includes('allahabad')) {
      return 'industrial';
    } else if (name.toLowerCase().includes('varanasi') || name.toLowerCase().includes('patna')) {
      return 'urban';
    } else if (riverKm > 2000) {
      return 'pristine';
    } else {
      // Pollution generally increases downstream
      const pollutionLevel = Math.min(riverKm / 2500, 1);
      if (pollutionLevel < 0.3) return 'rural';
      if (pollutionLevel < 0.6) return 'urban';
      return 'industrial';
    }
  }

  // Generate realistic parameter values
  generateParameterValue(parameter, baseValue, environmentalFactors, locationProfile, previousValue = null) {
    const { temperature, rainfall, industrialActivity, urbanRunoff, isMonsoon } = environmentalFactors;
    const { pollutionBase, variability } = this.locationProfiles[locationProfile];
    
    let value = baseValue;
    
    // Apply environmental effects based on parameter type
    switch (parameter) {
      case 'dissolvedOxygen':
        // Higher temperature reduces DO, rainfall increases it
        value *= (1 - (temperature - 20) * 0.02);
        value *= (1 + rainfall * 0.01);
        value *= (1 - pollutionBase * 0.5);
        value = Math.max(1, Math.min(14, value));
        break;
        
      case 'biochemicalOxygenDemand':
        // Increases with pollution and temperature
        value *= (1 + pollutionBase * 2);
        value *= (1 + (temperature - 20) * 0.03);
        value *= industrialActivity;
        if (isMonsoon) value *= 0.8; // Dilution effect
        value = Math.max(0.5, Math.min(30, value));
        break;
        
      case 'nitrate':
        // Increases with urban runoff and industrial activity
        value *= (1 + pollutionBase * 3);
        value *= urbanRunoff;
        value *= industrialActivity;
        if (isMonsoon) value *= 0.7; // Dilution effect
        value = Math.max(0.1, Math.min(100, value));
        break;
        
      case 'fecalColiform':
        // Dramatically increases with urban pollution
        value *= Math.pow(1 + pollutionBase * 5, 2);
        value *= urbanRunoff;
        if (isMonsoon) value *= 1.5; // Runoff increases contamination
        value = Math.max(10, Math.min(100000, value));
        break;
        
      case 'ph':
        // Industrial activity affects pH
        const phShift = (industrialActivity - 1) * 0.5 + (pollutionBase - 0.5) * 0.3;
        value += phShift;
        value = Math.max(6, Math.min(9, value));
        break;
        
      case 'turbidity':
        // Increases with rainfall and pollution
        value *= (1 + rainfall * 0.05);
        value *= (1 + pollutionBase * 2);
        value *= urbanRunoff;
        value = Math.max(1, Math.min(100, value));
        break;
        
      case 'temperature':
        value = temperature;
        break;
    }
    
    // Add random variation
    const randomVariation = (Math.random() - 0.5) * variability;
    value *= (1 + randomVariation);
    
    // Smooth transition from previous value if available
    if (previousValue !== null) {
      const maxChange = 0.15; // Maximum 15% change per update
      const change = (value - previousValue) / previousValue;
      if (Math.abs(change) > maxChange) {
        value = previousValue * (1 + Math.sign(change) * maxChange);
      }
    }
    
    return Math.round(value * 100) / 100;
  }

  // Calculate water quality status
  getWaterQualityStatus(parameters) {
    const { dissolvedOxygen, biochemicalOxygenDemand, nitrate, fecalColiform, ph, turbidity } = parameters;
    
    let score = 100;
    
    // DO scoring (higher is better)
    if (dissolvedOxygen.value < 4) score -= 30;
    else if (dissolvedOxygen.value < 6) score -= 15;
    else if (dissolvedOxygen.value > 8) score += 5;
    
    // BOD scoring (lower is better)
    if (biochemicalOxygenDemand.value > 6) score -= 25;
    else if (biochemicalOxygenDemand.value > 3) score -= 10;
    
    // Nitrate scoring (lower is better)
    if (nitrate.value > 45) score -= 20;
    else if (nitrate.value > 10) score -= 10;
    
    // Fecal coliform scoring (lower is better)
    if (fecalColiform.value > 2500) score -= 35;
    else if (fecalColiform.value > 500) score -= 20;
    else if (fecalColiform.value > 50) score -= 10;
    
    // pH scoring (7-8.5 is ideal)
    const phDiff = Math.abs(ph.value - 7.5);
    if (phDiff > 1) score -= 15;
    else if (phDiff > 0.5) score -= 5;
    
    // Turbidity scoring (lower is better)
    if (turbidity.value > 25) score -= 15;
    else if (turbidity.value > 10) score -= 8;
    
    score = Math.max(0, Math.min(100, score));
    
    let status = 'excellent';
    if (score < 25) status = 'very_poor';
    else if (score < 50) status = 'poor';
    else if (score < 70) status = 'moderate';
    else if (score < 85) status = 'good';
    
    return { wqi: Math.round(score), status };
  }

  // Generate water quality data for a location
  async generateLocationData(location) {
    try {
      const environmentalFactors = this.getCurrentEnvironmentalFactors();
      const locationProfile = this.getLocationProfile(location);
      
      // Get previous reading for smooth transitions
      const previousReading = await WaterQuality.findOne({ locationId: location._id })
        .sort({ timestamp: -1 });
      
      // Base parameter values
      const baseParameters = {
        dissolvedOxygen: 7.5,
        biochemicalOxygenDemand: 3.0,
        nitrate: 5.0,
        fecalColiform: 100,
        ph: 7.5,
        turbidity: 8.0
      };
      
      // Generate realistic parameter values
      const parameters = {};
      for (const [param, baseValue] of Object.entries(baseParameters)) {
        const previousValue = previousReading?.parameters[param]?.value || null;
        const value = this.generateParameterValue(
          param, 
          baseValue, 
          environmentalFactors, 
          locationProfile, 
          previousValue
        );
        
        parameters[param] = {
          value,
          unit: this.getParameterUnit(param),
          status: this.getParameterStatus(param, value)
        };
      }
      
      // Add temperature
      parameters.temperature = {
        value: environmentalFactors.temperature,
        unit: '°C',
        status: 'normal'
      };
      
      // Calculate overall water quality
      const { wqi, status } = this.getWaterQualityStatus(parameters);
      
      // Create new water quality record
      const waterQualityData = new WaterQuality({
        locationId: location._id,
        timestamp: new Date(),
        parameters,
        waterQualityIndex: wqi,
        overallStatus: status,
        environmentalConditions: {
          temperature: environmentalFactors.temperature,
          rainfall: environmentalFactors.rainfall,
          industrialActivity: environmentalFactors.industrialActivity,
          urbanRunoff: environmentalFactors.urbanRunoff
        },
        dataSource: 'simulation'
      });
      
      await waterQualityData.save();
      console.log(`✓ Generated data for ${location.name}: WQI ${wqi} (${status})`);
      
      return waterQualityData;
    } catch (error) {
      console.error(`Error generating data for ${location.name}:`, error);
      throw error;
    }
  }

  // Get parameter unit
  getParameterUnit(parameter) {
    const units = {
      dissolvedOxygen: 'mg/L',
      biochemicalOxygenDemand: 'mg/L',
      nitrate: 'mg/L',
      fecalColiform: 'MPN/100ml',
      ph: '',
      turbidity: 'NTU',
      temperature: '°C'
    };
    return units[parameter] || '';
  }

  // Get parameter status based on value
  getParameterStatus(parameter, value) {
    const thresholds = {
      dissolvedOxygen: { excellent: 8, good: 6, fair: 4, poor: 2 },
      biochemicalOxygenDemand: { excellent: 2, good: 3, fair: 6, poor: 10 },
      nitrate: { excellent: 5, good: 10, fair: 45, poor: 100 },
      fecalColiform: { excellent: 50, good: 500, fair: 2500, poor: 10000 },
      ph: { excellent: [7, 8.5], good: [6.5, 9], fair: [6, 9.5], poor: [5, 10] },
      turbidity: { excellent: 5, good: 10, fair: 25, poor: 50 }
    };
    
    const threshold = thresholds[parameter];
    if (!threshold) return 'unknown';
    
    if (parameter === 'ph') {
      if (value >= threshold.excellent[0] && value <= threshold.excellent[1]) return 'excellent';
      if (value >= threshold.good[0] && value <= threshold.good[1]) return 'good';
      if (value >= threshold.fair[0] && value <= threshold.fair[1]) return 'fair';
      return 'poor';
    } else if (parameter === 'dissolvedOxygen') {
      if (value >= threshold.excellent) return 'excellent';
      if (value >= threshold.good) return 'good';
      if (value >= threshold.fair) return 'fair';
      return 'poor';
    } else {
      if (value <= threshold.excellent) return 'excellent';
      if (value <= threshold.good) return 'good';
      if (value <= threshold.fair) return 'fair';
      return 'poor';
    }
  }

  // Start real-time simulation
  async startSimulation() {
    if (this.isRunning) {
      console.log('⚠️ Data simulation is already running');
      return;
    }
    
    console.log('🚀 Starting real-time data simulation...');
    this.isRunning = true;
    
    // Generate initial data
    await this.generateDataForAllLocations();
    
    // Set up interval for continuous data generation
    this.simulationInterval = setInterval(async () => {
      try {
        await this.generateDataForAllLocations();
      } catch (error) {
        console.error('Error in simulation interval:', error);
      }
    }, this.updateInterval);
    
    console.log(`✅ Real-time simulation started (updates every ${this.updateInterval / 60000} minutes)`);
  }

  // Stop simulation
  stopSimulation() {
    if (!this.isRunning) {
      console.log('⚠️ Data simulation is not running');
      return;
    }
    
    console.log('🛑 Stopping real-time data simulation...');
    this.isRunning = false;
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    console.log('✅ Real-time simulation stopped');
  }

  // Generate data for all active locations
  async generateDataForAllLocations() {
    try {
      const locations = await Location.find({ isActive: true });
      const results = [];
      
      for (const location of locations) {
        try {
          const data = await this.generateLocationData(location);
          results.push(data);
        } catch (error) {
          console.error(`Failed to generate data for ${location.name}:`, error);
        }
      }
      
      console.log(`📊 Generated data for ${results.length}/${locations.length} locations`);
      return results;
    } catch (error) {
      console.error('Error generating data for all locations:', error);
      throw error;
    }
  }

  // Get simulation status
  getStatus() {
    return {
      isRunning: this.isRunning,
      updateInterval: this.updateInterval,
      nextUpdate: this.isRunning ? new Date(Date.now() + this.updateInterval) : null
    };
  }
}

module.exports = new DataSimulationService();