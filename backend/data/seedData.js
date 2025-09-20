const mongoose = require('mongoose');
const moment = require('moment');
require('dotenv').config();

// Import models
const Location = require('../models/Location');
const WaterQuality = require('../models/WaterQuality');
const Forecast = require('../models/Forecast');
const Alert = require('../models/Alert');

// Connect to database
const connectDB = async () => {
  try {
    const MONGODB_URI = 'mongodb+srv://megha99734_db_user:2dFD4Sgt4Ewr5d1S@cluster0.byca9ck.mongodb.net/river-project?retryWrites=true&w=majority';
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample locations along the Ganga River
const sampleLocations = [
  {
    name: 'Gangotri',
    city: 'Gangotri',
    state: 'Uttarakhand',
    coordinates: {
      latitude: 30.9993,
      longitude: 78.9629
    },
    riverKm: 0,
    description: 'Source of the Ganga River',
    isActive: true
  },
  {
    name: 'Haridwar',
    city: 'Haridwar',
    state: 'Uttarakhand',
    coordinates: {
      latitude: 29.9457,
      longitude: 78.1642
    },
    riverKm: 253,
    description: 'Holy city where Ganga enters the plains',
    isActive: true
  },
  {
    name: 'Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    coordinates: {
      latitude: 26.4499,
      longitude: 80.3319
    },
    riverKm: 1017,
    description: 'Major industrial city on Ganga',
    isActive: true
  },
  {
    name: 'Allahabad (Prayagraj)',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    coordinates: {
      latitude: 25.4358,
      longitude: 81.8463
    },
    riverKm: 1226,
    description: 'Confluence of Ganga, Yamuna, and Saraswati',
    isActive: true
  },
  {
    name: 'Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    coordinates: {
      latitude: 25.3176,
      longitude: 83.0047
    },
    riverKm: 1384,
    description: 'Ancient holy city on the banks of Ganga',
    isActive: true
  },
  {
    name: 'Patna',
    city: 'Patna',
    state: 'Bihar',
    coordinates: {
      latitude: 25.5941,
      longitude: 85.1376
    },
    riverKm: 1663,
    description: 'Capital of Bihar on Ganga banks',
    isActive: true
  },
  {
    name: 'Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    coordinates: {
      latitude: 22.5726,
      longitude: 88.3639
    },
    riverKm: 2071,
    description: 'Major city near Ganga delta',
    isActive: true
  },
  {
    name: 'Rishikesh',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    coordinates: {
      latitude: 30.0869,
      longitude: 78.2676
    },
    riverKm: 200,
    description: 'Yoga capital and gateway to Himalayas',
    isActive: true
  },
  {
    name: 'Garhmukteshwar',
    city: 'Garhmukteshwar',
    state: 'Uttar Pradesh',
    coordinates: {
      latitude: 28.7875,
      longitude: 78.1089
    },
    riverKm: 450,
    description: 'Important pilgrimage site on Ganga',
    isActive: true
  },
  {
    name: 'Farrukhabad',
    city: 'Farrukhabad',
    state: 'Uttar Pradesh',
    coordinates: {
      latitude: 27.3895,
      longitude: 79.5804
    },
    riverKm: 850,
    description: 'Industrial town on Ganga banks',
    isActive: true
  },
  {
    name: 'Mirzapur',
    city: 'Mirzapur',
    state: 'Uttar Pradesh',
    coordinates: {
      latitude: 25.1468,
      longitude: 82.5690
    },
    riverKm: 1320,
    description: 'Carpet weaving center on Ganga',
    isActive: true
  },
  {
    name: 'Bhagalpur',
    city: 'Bhagalpur',
    state: 'Bihar',
    coordinates: {
      latitude: 25.2425,
      longitude: 86.9842
    },
    riverKm: 1800,
    description: 'Silk city on Ganga banks',
    isActive: true
  },
  {
    name: 'Rajmahal',
    city: 'Rajmahal',
    state: 'Jharkhand',
    coordinates: {
      latitude: 25.0534,
      longitude: 87.8311
    },
    riverKm: 1950,
    description: 'Historic town on Ganga banks',
    isActive: true
  },
  {
    name: 'Farakka',
    city: 'Farakka',
    state: 'West Bengal',
    coordinates: {
      latitude: 24.8180,
      longitude: 87.9267
    },
    riverKm: 2000,
    description: 'Location of Farakka Barrage',
    isActive: true
  },
  {
    name: 'Murshidabad',
    city: 'Murshidabad',
    state: 'West Bengal',
    coordinates: {
      latitude: 24.1833,
      longitude: 88.2833
    },
    riverKm: 2100,
    description: 'Former capital of Bengal',
    isActive: true
  },
  {
    name: 'Mayurbhanj',
    city: 'Mayurbhanj',
    state: 'West Bengal',
    coordinates: {
      latitude: 23.9833,
      longitude: 88.4167
    },
    riverKm: 2150,
    description: 'River bend location',
    isActive: true
  }
];

// Function to generate realistic water quality parameters
function generateWaterQualityData(location, timestamp) {
  // Base values that vary by location (pollution increases downstream)
  const pollutionFactor = location.riverKm / 2500; // 0 to ~0.8
  
  // Seasonal variations
  const month = moment(timestamp).month();
  const isWinter = month >= 10 || month <= 2;
  const isMonsoon = month >= 6 && month <= 9;
  
  // Random variations
  const randomFactor = () => 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  
  // Dissolved Oxygen (higher is better, decreases with pollution)
  let dissolvedOxygen = (8.5 - pollutionFactor * 4) * randomFactor();
  if (isMonsoon) dissolvedOxygen *= 1.1; // Better in monsoon
  dissolvedOxygen = Math.max(1, Math.min(12, dissolvedOxygen));
  
  // BOD (lower is better, increases with pollution)
  let biochemicalOxygenDemand = (2 + pollutionFactor * 8) * randomFactor();
  if (isWinter) biochemicalOxygenDemand *= 0.9; // Slightly better in winter
  biochemicalOxygenDemand = Math.max(1, Math.min(15, biochemicalOxygenDemand));
  
  // Nitrate (lower is better, increases with pollution)
  let nitrate = (5 + pollutionFactor * 40) * randomFactor();
  if (isMonsoon) nitrate *= 0.8; // Diluted in monsoon
  nitrate = Math.max(1, Math.min(60, nitrate));
  
  // Fecal Coliform (lower is better, increases dramatically with pollution)
  let fecalColiform = (50 + pollutionFactor * 4000) * randomFactor();
  if (isMonsoon) fecalColiform *= 1.3; // Worse in monsoon due to runoff
  fecalColiform = Math.max(10, Math.min(10000, fecalColiform));
  
  // pH (7 is neutral, varies with pollution)
  let ph = 7.2 + (pollutionFactor - 0.4) * 1.5 + (Math.random() - 0.5) * 0.8;
  ph = Math.max(5.5, Math.min(9.5, ph));
  
  // Turbidity (lower is better, increases with pollution and monsoon)
  let turbidity = (3 + pollutionFactor * 15) * randomFactor();
  if (isMonsoon) turbidity *= 2; // Much higher in monsoon
  turbidity = Math.max(1, Math.min(50, turbidity));
  
  // Helper function to determine status
  const getStatus = (value, thresholds) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.moderate) return 'moderate';
    return 'poor';
  };
  
  const getStatusReverse = (value, thresholds) => {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.moderate) return 'moderate';
    return 'poor';
  };
  
  const getStatusPH = (value) => {
    if (value >= 6.5 && value <= 8.5) return 'good';
    if (value >= 6.0 && value <= 9.0) return 'moderate';
    return 'poor';
  };
  
  const parameters = {
    dissolvedOxygen: {
      value: Math.round(dissolvedOxygen * 10) / 10,
      unit: 'mg/L',
      status: getStatusReverse(dissolvedOxygen, { good: 6, moderate: 4 })
    },
    biochemicalOxygenDemand: {
      value: Math.round(biochemicalOxygenDemand * 10) / 10,
      unit: 'mg/L',
      status: getStatus(biochemicalOxygenDemand, { good: 3, moderate: 6 })
    },
    nitrate: {
      value: Math.round(nitrate * 10) / 10,
      unit: 'mg/L',
      status: getStatus(nitrate, { good: 15, moderate: 35 })
    },
    fecalColiform: {
      value: Math.round(fecalColiform),
      unit: 'MPN/100ml',
      status: getStatus(fecalColiform, { good: 200, moderate: 1000 })
    },
    ph: {
      value: Math.round(ph * 10) / 10,
      unit: '',
      status: getStatusPH(ph)
    },
    turbidity: {
      value: Math.round(turbidity * 10) / 10,
      unit: 'NTU',
      status: getStatus(turbidity, { good: 8, moderate: 15 })
    }
  };
  
  // Calculate Water Quality Index (simplified)
  const statusScores = { good: 3, moderate: 2, poor: 1 };
  const avgScore = Object.values(parameters).reduce((sum, param) => sum + statusScores[param.status], 0) / 6;
  
  let waterQualityIndex = Math.round(avgScore * 33.33); // Scale to 0-100
  let overallStatus;
  if (waterQualityIndex >= 80) overallStatus = 'excellent';
  else if (waterQualityIndex >= 60) overallStatus = 'good';
  else if (waterQualityIndex >= 40) overallStatus = 'moderate';
  else if (waterQualityIndex >= 20) overallStatus = 'poor';
  else overallStatus = 'very_poor';
  
  // Temperature parameter (required by model)
  const temperature = 15 + Math.random() * 20; // 15-35°C
  parameters.temperature = {
    value: Math.round(temperature * 10) / 10,
    unit: '°C'
  };
  
  // Weather conditions
  const rainfall = isMonsoon ? Math.round(Math.random() * 50) : Math.round(Math.random() * 5); // mm
  const humidity = Math.round(40 + Math.random() * 40); // 40-80%
  const windSpeed = Math.round(Math.random() * 20); // 0-20 km/h
  
  return {
    locationId: location._id,
    timestamp,
    parameters,
    waterQualityIndex,
    overallStatus,
    weather: {
      rainfall,
      humidity,
      windSpeed
    },
    dataSource: 'simulated',
    qualityFlags: {
      validated: true,
      anomaly: Math.random() > 0.95 // 5% chance of anomaly
    }
  };
}

// Function to seed locations
async function seedLocations() {
  try {
    console.log('Seeding locations...');
    
    // Clear existing locations
    await Location.deleteMany({});
    
    // Insert sample locations
    const locations = await Location.insertMany(sampleLocations);
    console.log(`✓ Inserted ${locations.length} locations`);
    
    return locations;
  } catch (error) {
    console.error('Error seeding locations:', error);
    throw error;
  }
}

// Function to seed water quality data
async function seedWaterQualityData(locations) {
  try {
    console.log('💧 Generating water quality data...');
    
    // Clear existing data
    await WaterQuality.deleteMany({});
    
    const waterQualityData = [];
    
    // Generate data for each location for the last 10 days
    for (const location of locations) {
      for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
        const timestamp = moment().subtract(dayOffset, 'days').toDate();
        
        // Generate 3-6 readings per day per location
        const readingsPerDay = Math.floor(Math.random() * 4) + 3;
        
        for (let reading = 0; reading < readingsPerDay; reading++) {
          const readingTime = moment(timestamp)
            .add(Math.floor(Math.random() * 24), 'hours')
            .add(Math.floor(Math.random() * 60), 'minutes')
            .toDate();
          
          const data = generateWaterQualityData(location, readingTime);
          waterQualityData.push(data);
        }
      }
    }
    
    const insertedData = await WaterQuality.insertMany(waterQualityData);
    console.log(`✓ Generated ${insertedData.length} water quality records`);
    
    return insertedData;
  } catch (error) {
    console.error('Error seeding water quality data:', error);
    throw error;
  }
}

// Function to generate forecasts
async function seedForecasts(locations) {
  try {
    console.log('Generating forecasts...');
    
    // Clear existing forecasts
    await Forecast.deleteMany({});
    
    const forecasts = [];
    
    for (const location of locations) {
      // Get latest water quality data for this location
      const latestData = await WaterQuality.findOne({ locationId: location._id })
        .sort({ timestamp: -1 });
      
      if (!latestData) continue;
      
      // Generate 3-day forecast
      const predictions = [];
      const forecastAlerts = [];
      
      for (let day = 1; day <= 3; day++) {
        const forecastDate = moment().add(day, 'days').toDate();
        
        // Simple trend-based forecasting (with some randomness)
        const trendFactor = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
        const seasonalFactor = Math.sin(moment().dayOfYear() / 365 * 2 * Math.PI) * 0.1 + 1;
        
        const params = latestData.parameters;
        const trends = ['improving', 'stable', 'declining'];
        
        // Generate predictions for required parameters only
        const predictedParams = {
          dissolvedOxygen: {
            predicted: Math.round(params.dissolvedOxygen.value * trendFactor * seasonalFactor * 10) / 10,
            confidence: Math.max(60, 90 - day * 10),
            trend: trends[Math.floor(Math.random() * trends.length)]
          },
          biochemicalOxygenDemand: {
            predicted: Math.round(params.biochemicalOxygenDemand.value * trendFactor * seasonalFactor * 10) / 10,
            confidence: Math.max(60, 90 - day * 10),
            trend: trends[Math.floor(Math.random() * trends.length)]
          },
          nitrate: {
            predicted: Math.round(params.nitrate.value * trendFactor * seasonalFactor * 10) / 10,
            confidence: Math.max(60, 90 - day * 10),
            trend: trends[Math.floor(Math.random() * trends.length)]
          },
          fecalColiform: {
            predicted: Math.round(params.fecalColiform.value * trendFactor * seasonalFactor),
            confidence: Math.max(60, 90 - day * 10),
            trend: trends[Math.floor(Math.random() * trends.length)]
          }
        };
        
        // Calculate predicted WQI
        const predictedWQI = Math.max(10, Math.min(100, 
          latestData.waterQualityIndex * trendFactor + (Math.random() - 0.5) * 10
        ));
        
        let predictedStatus;
        if (predictedWQI >= 80) predictedStatus = 'excellent';
        else if (predictedWQI >= 60) predictedStatus = 'good';
        else if (predictedWQI >= 40) predictedStatus = 'moderate';
        else if (predictedWQI >= 20) predictedStatus = 'poor';
        else predictedStatus = 'very_poor';
        
        predictions.push({
          date: forecastDate,
          dayOffset: day,
          parameters: predictedParams,
          predictedWQI: Math.round(predictedWQI),
          predictedStatus,
          expectedWeather: {
            rainfall: Math.round(Math.random() * 10),
            temperature: Math.round(20 + Math.random() * 15),
            humidity: Math.round(50 + Math.random() * 30)
          }
        });
        
        // Check for potential alerts
        if (predictedStatus === 'poor' || predictedWQI < 40) {
          forecastAlerts.push({
            day,
            parameter: 'overall',
            severity: predictedWQI < 25 ? 'high' : 'medium',
            message: `Poor water quality predicted for ${location.name} on day ${day}`
          });
        }
      }
      
      const forecast = {
        locationId: location._id,
        forecastDate: new Date(),
        generatedAt: new Date(),
        predictions,
        modelInfo: {
          algorithm: 'rule-based',
          version: '1.0',
          accuracy: 75
        },
        forecastAlerts
      };
      
      forecasts.push(forecast);
    }
    
    const insertedForecasts = await Forecast.insertMany(forecasts);
    console.log(`✓ Generated ${insertedForecasts.length} forecasts`);
    
    return insertedForecasts;
  } catch (error) {
    console.error('Error generating forecasts:', error);
    throw error;
  }
}

// Function to generate sample alerts
async function seedAlerts(locations) {
  try {
    console.log('🚨 Generating sample alerts...');
    
    // Clear existing alerts
    await Alert.deleteMany({});
    
    const alerts = [];
    const alertTypes = ['pollution', 'contamination', 'chemical', 'biological', 'physical'];
    const severityLevels = [
      { severity: 'low', level: 1, levelName: 'NORMAL', color: '#10B981', bgColor: '#ECFDF5' },
      { severity: 'medium', level: 2, levelName: 'ADVISORY', color: '#F59E0B', bgColor: '#FFFBEB' },
      { severity: 'medium', level: 3, levelName: 'WARNING', color: '#EF4444', bgColor: '#FEF2F2' },
      { severity: 'high', level: 4, levelName: 'CRITICAL', color: '#DC2626', bgColor: '#FEF2F2' },
      { severity: 'critical', level: 5, levelName: 'EMERGENCY', color: '#991B1B', bgColor: '#FEF2F2' }
    ];
    
    // Generate alerts for the last 10 days and next 3 days
    for (let dayOffset = -3; dayOffset < 10; dayOffset++) {
      const alertDate = dayOffset < 0 
        ? moment().add(Math.abs(dayOffset), 'days').toDate()
        : moment().subtract(dayOffset, 'days').toDate();
      
      // Generate 2-5 alerts per day
      const alertsPerDay = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < alertsPerDay; i++) {
        const location = locations[Math.floor(Math.random() * locations.length)];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const severityData = severityLevels[Math.floor(Math.random() * severityLevels.length)];
        
        // Generate alert based on location pollution factor
        const pollutionFactor = location.riverKm / 2500;
        const isHighPollution = pollutionFactor > 0.4;
        
        let title, message, parameters, thresholds;
        
        switch (alertType) {
          case 'pollution':
            title = `High Pollution Detected at ${location.name}`;
            message = `Elevated pollution levels detected in water samples from ${location.name}. Immediate attention required.`;
            parameters = {
              dissolvedOxygen: Math.round((3 + Math.random() * 2) * 100) / 100,
              biochemicalOxygenDemand: Math.round((8 + Math.random() * 5) * 100) / 100,
              turbidity: Math.round((15 + Math.random() * 10) * 100) / 100
            };
            thresholds = {
              exceeded: 'Biochemical Oxygen Demand',
              value: parameters.biochemicalOxygenDemand,
              limit: 6.0
            };
            break;
            
          case 'contamination':
            title = `Bacterial Contamination Alert - ${location.name}`;
            message = `High levels of fecal coliform bacteria detected. Water unsafe for human contact.`;
            parameters = {
              fecalColiform: Math.round((2000 + Math.random() * 8000)),
              totalColiform: Math.round((5000 + Math.random() * 15000))
            };
            thresholds = {
              exceeded: 'Fecal Coliform',
              value: parameters.fecalColiform,
              limit: 1000
            };
            break;
            
          case 'chemical':
            title = `Chemical Parameter Violation - ${location.name}`;
            message = `Chemical parameters exceed safe limits. Potential industrial discharge detected.`;
            parameters = {
              nitrate: Math.round((25 + Math.random() * 20) * 100) / 100,
              phosphate: Math.round((2 + Math.random() * 3) * 100) / 100,
              heavyMetals: Math.round((0.5 + Math.random() * 1.5) * 100) / 100
            };
            thresholds = {
              exceeded: 'Nitrate',
              value: parameters.nitrate,
              limit: 10.0
            };
            break;
            
          case 'biological':
            title = `Biological Oxygen Demand Critical - ${location.name}`;
            message = `Extremely high BOD levels indicate severe organic pollution.`;
            parameters = {
              biochemicalOxygenDemand: Math.round((12 + Math.random() * 8) * 100) / 100,
              dissolvedOxygen: Math.round((1 + Math.random() * 2) * 100) / 100
            };
            thresholds = {
              exceeded: 'BOD',
              value: parameters.biochemicalOxygenDemand,
              limit: 6.0
            };
            break;
            
          case 'physical':
            title = `Physical Parameter Alert - ${location.name}`;
            message = `Unusual physical characteristics detected in water samples.`;
            parameters = {
              turbidity: Math.round((25 + Math.random() * 15) * 100) / 100,
              temperature: Math.round((32 + Math.random() * 8) * 100) / 100,
              conductivity: Math.round((800 + Math.random() * 400))
            };
            thresholds = {
              exceeded: 'Turbidity',
              value: parameters.turbidity,
              limit: 10.0
            };
            break;
        }
        
        // Adjust severity based on location pollution
        let finalSeverityData = severityData;
        if (isHighPollution && Math.random() > 0.3) {
          // Higher chance of severe alerts in polluted areas
          finalSeverityData = severityLevels[Math.min(severityLevels.length - 1, severityData.level + 1)];
        }
        
        const alert = {
          locationId: location._id,
          locationName: location.name,
          type: alertType,
          severity: finalSeverityData.severity,
          level: finalSeverityData.level,
          levelName: finalSeverityData.levelName,
          color: finalSeverityData.color,
          bgColor: finalSeverityData.bgColor,
          title,
          message,
          parameters,
          thresholds,
          status: Math.random() > 0.8 ? 'resolved' : 'active',
          resolved: Math.random() > 0.8,
          priority: finalSeverityData.level,
          source: 'automated',
          tags: [alertType, location.state.toLowerCase()],
          createdAt: alertDate,
          updatedAt: alertDate
        };
        
        // Add resolution data for resolved alerts
        if (alert.status === 'resolved') {
          alert.resolvedAt = moment(alertDate).add(Math.random() * 24, 'hours').toDate();
          alert.resolvedBy = 'System Administrator';
        }
        
        alerts.push(alert);
      }
    }
    
    const insertedAlerts = await Alert.insertMany(alerts);
    console.log(`✓ Generated ${insertedAlerts.length} sample alerts`);
    
    return insertedAlerts;
  } catch (error) {
    console.error('Error seeding alerts:', error);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await connectDB();
    
    // Seed locations
    const locations = await seedLocations();
    
    // Seed water quality data
    await seedWaterQualityData(locations);
    
    // Generate forecasts
    await seedForecasts(locations);
    
    // Generate alerts
    await seedAlerts(locations);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- ${locations.length} monitoring locations`);
    console.log(`- ${await WaterQuality.countDocuments()} water quality records`);
    console.log(`- ${await Forecast.countDocuments()} forecasts generated`);
    console.log(`- ${await Alert.countDocuments()} alerts generated`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  seedLocations,
  seedWaterQualityData,
  seedForecasts,
  seedAlerts
};