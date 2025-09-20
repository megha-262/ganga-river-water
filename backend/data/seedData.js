const mongoose = require('mongoose');
const moment = require('moment');
require('dotenv').config();

// Import models
const Location = require('../models/Location');
const WaterQuality = require('../models/WaterQuality');
const Forecast = require('../models/Forecast');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ganga-water-monitoring');
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
    console.log('Seeding water quality data...');
    
    // Clear existing water quality data
    await WaterQuality.deleteMany({});
    
    const waterQualityData = [];
    const now = moment();
    
    // Generate data for last 15 days (every 6 hours = 4 readings per day)
    for (let day = 14; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour += 6) {
        const timestamp = now.clone().subtract(day, 'days').hour(hour).minute(0).second(0).toDate();
        
        for (const location of locations) {
          const data = generateWaterQualityData(location, timestamp);
          waterQualityData.push(data);
        }
      }
    }
    
    // Insert in batches to avoid memory issues
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < waterQualityData.length; i += batchSize) {
      const batch = waterQualityData.slice(i, i + batchSize);
      await WaterQuality.insertMany(batch);
      inserted += batch.length;
      console.log(`  Inserted ${inserted}/${waterQualityData.length} water quality records`);
    }
    
    console.log(`✓ Inserted ${inserted} water quality records`);
    return inserted;
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
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- ${locations.length} monitoring locations`);
    console.log(`- ${await WaterQuality.countDocuments()} water quality records`);
    console.log(`- ${await Forecast.countDocuments()} forecasts generated`);
    
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
  seedForecasts
};