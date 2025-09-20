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
      type: 'Point',
      coordinates: [78.9629, 30.9993] // [longitude, latitude]
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
      type: 'Point',
      coordinates: [78.1642, 29.9457]
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
      type: 'Point',
      coordinates: [80.3319, 26.4499]
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
      type: 'Point',
      coordinates: [81.8463, 25.4358]
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
      type: 'Point',
      coordinates: [83.0047, 25.3176]
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
      type: 'Point',
      coordinates: [85.1376, 25.5941]
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
      type: 'Point',
      coordinates: [88.3639, 22.5726]
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
    if (value <= thresholds.excellent) return 'excellent';
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.fair) return 'fair';
    return 'poor';
  };
  
  const getStatusReverse = (value, thresholds) => {
    if (value >= thresholds.excellent) return 'excellent';
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.fair) return 'fair';
    return 'poor';
  };
  
  const getStatusPH = (value) => {
    if (value >= 6.5 && value <= 8.5) return 'excellent';
    if (value >= 6.0 && value <= 9.0) return 'good';
    if (value >= 5.5 && value <= 9.5) return 'fair';
    return 'poor';
  };
  
  const parameters = {
    dissolvedOxygen: {
      value: Math.round(dissolvedOxygen * 10) / 10,
      unit: 'mg/L',
      status: getStatusReverse(dissolvedOxygen, { excellent: 8, good: 6, fair: 4 })
    },
    biochemicalOxygenDemand: {
      value: Math.round(biochemicalOxygenDemand * 10) / 10,
      unit: 'mg/L',
      status: getStatus(biochemicalOxygenDemand, { excellent: 3, good: 5, fair: 8 })
    },
    nitrate: {
      value: Math.round(nitrate * 10) / 10,
      unit: 'mg/L',
      status: getStatus(nitrate, { excellent: 10, good: 20, fair: 45 })
    },
    fecalColiform: {
      value: Math.round(fecalColiform),
      unit: 'MPN/100ml',
      status: getStatus(fecalColiform, { excellent: 50, good: 500, fair: 2500 })
    },
    ph: {
      value: Math.round(ph * 10) / 10,
      unit: '',
      status: getStatusPH(ph)
    },
    turbidity: {
      value: Math.round(turbidity * 10) / 10,
      unit: 'NTU',
      status: getStatus(turbidity, { excellent: 5, good: 10, fair: 20 })
    }
  };
  
  // Calculate Water Quality Index (simplified)
  const statusScores = { excellent: 4, good: 3, fair: 2, poor: 1 };
  const avgScore = Object.values(parameters).reduce((sum, param) => sum + statusScores[param.status], 0) / 6;
  
  let waterQualityIndex = Math.round(avgScore * 25); // Scale to 0-100
  let overallStatus;
  if (waterQualityIndex >= 80) overallStatus = 'excellent';
  else if (waterQualityIndex >= 60) overallStatus = 'good';
  else if (waterQualityIndex >= 40) overallStatus = 'fair';
  else overallStatus = 'poor';
  
  // Weather conditions
  const weatherConditions = ['sunny', 'cloudy', 'rainy', 'overcast'];
  const weather = isMonsoon ? 
    (Math.random() > 0.6 ? 'rainy' : 'cloudy') : 
    weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  
  return {
    locationId: location._id,
    timestamp,
    parameters,
    waterQualityIndex,
    overallStatus,
    weather: {
      condition: weather,
      temperature: Math.round(15 + Math.random() * 20), // 15-35°C
      humidity: Math.round(40 + Math.random() * 40) // 40-80%
    },
    dataSource: 'simulated',
    qualityFlags: {
      validated: true,
      calibrated: true,
      outlier: Math.random() > 0.95 // 5% chance of outlier
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
        const predictedParams = {};
        
        Object.keys(params).forEach(key => {
          let predictedValue = params[key].value * trendFactor * seasonalFactor;
          
          // Add some day-specific variation
          predictedValue *= (1 + (Math.random() - 0.5) * 0.2 * day);
          
          predictedParams[key] = {
            value: Math.round(predictedValue * 10) / 10,
            unit: params[key].unit,
            confidence: Math.max(0.6, 0.9 - day * 0.1) // Decreasing confidence
          };
        });
        
        // Calculate predicted WQI
        const predictedWQI = Math.max(10, Math.min(100, 
          latestData.waterQualityIndex * trendFactor + (Math.random() - 0.5) * 10
        ));
        
        let predictedStatus;
        if (predictedWQI >= 80) predictedStatus = 'excellent';
        else if (predictedWQI >= 60) predictedStatus = 'good';
        else if (predictedWQI >= 40) predictedStatus = 'fair';
        else predictedStatus = 'poor';
        
        predictions.push({
          day,
          date: forecastDate,
          parameters: predictedParams,
          predictedWQI: Math.round(predictedWQI),
          predictedStatus,
          confidence: Math.max(0.6, 0.9 - day * 0.1),
          expectedWeather: {
            condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
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
        generatedAt: new Date(),
        predictions,
        modelInfo: {
          name: 'Simple Trend Model',
          version: '1.0',
          accuracy: 0.75,
          lastTrained: moment().subtract(7, 'days').toDate()
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