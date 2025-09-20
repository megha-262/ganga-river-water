const mongoose = require('mongoose');
const WaterQuality = require('../models/WaterQuality');
const Location = require('../models/Location');
const Alert = require('../models/Alert');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ganga-water-monitoring', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Ganga River monitoring locations
const locations = [
  {
    name: 'Haridwar',
    city: 'Haridwar',
    coordinates: {
      latitude: 29.9457,
      longitude: 78.1642
    },
    riverKm: 253,
    state: 'Uttarakhand',
    description: 'Major pilgrimage site where Ganga enters the plains',
    type: 'urban'
  },
  {
    name: 'Rishikesh',
    city: 'Rishikesh',
    coordinates: {
      latitude: 30.0869,
      longitude: 78.2676
    },
    riverKm: 238,
    state: 'Uttarakhand',
    description: 'Spiritual center in the foothills of Himalayas',
    type: 'semi-urban'
  },
  {
    name: 'Kanpur',
    city: 'Kanpur',
    coordinates: {
      latitude: 26.4499,
      longitude: 80.3319
    },
    riverKm: 1017,
    state: 'Uttar Pradesh',
    description: 'Major industrial city with significant pollution sources',
    type: 'industrial'
  },
  {
    name: 'Allahabad (Prayagraj)',
    city: 'Prayagraj',
    coordinates: {
      latitude: 25.4358,
      longitude: 81.8463
    },
    riverKm: 1235,
    state: 'Uttar Pradesh',
    description: 'Confluence of Ganga, Yamuna, and mythical Saraswati',
    type: 'urban'
  },
  {
    name: 'Varanasi',
    city: 'Varanasi',
    coordinates: {
      latitude: 25.3176,
      longitude: 83.0047
    },
    riverKm: 1388,
    state: 'Uttar Pradesh',
    description: 'Ancient holy city with numerous ghats',
    type: 'urban'
  },
  {
    name: 'Patna',
    city: 'Patna',
    coordinates: {
      latitude: 25.5941,
      longitude: 85.1376
    },
    riverKm: 1541,
    state: 'Bihar',
    description: 'Capital city of Bihar with urban pollution',
    type: 'urban'
  },
  {
    name: 'Bhagalpur',
    city: 'Bhagalpur',
    coordinates: {
      latitude: 25.2425,
      longitude: 87.0042
    },
    riverKm: 1729,
    state: 'Bihar',
    description: 'Silk city with textile industry impact',
    type: 'industrial'
  },
  {
    name: 'Kolkata',
    city: 'Kolkata',
    coordinates: {
      latitude: 22.5726,
      longitude: 88.3639
    },
    riverKm: 2071,
    state: 'West Bengal',
    description: 'Major metropolitan city near Ganga delta',
    type: 'urban'
  }
];

// Helper function to determine parameter status
function getParameterStatus(value, parameter) {
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

// Calculate overall water quality index
function calculateWQI(parameters) {
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

// Generate random water quality data
function generateWaterQualityData(locationId, locationName, locationType) {
  const data = [];
  const now = new Date();
  
  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Base values depending on location type
    let baseValues = {
      dissolvedOxygen: 6.5,
      biochemicalOxygenDemand: 3.0,
      nitrate: 2.0,
      fecalColiform: 1000,
      ph: 7.5,
      turbidity: 15,
      temperature: 25
    };
    
    // Adjust base values based on location type
    if (locationType === 'industrial') {
      baseValues.dissolvedOxygen = 4.5;
      baseValues.biochemicalOxygenDemand = 8.0;
      baseValues.nitrate = 5.0;
      baseValues.fecalColiform = 5000;
      baseValues.turbidity = 25;
    } else if (locationType === 'urban') {
      baseValues.dissolvedOxygen = 5.0;
      baseValues.biochemicalOxygenDemand = 6.0;
      baseValues.nitrate = 3.5;
      baseValues.fecalColiform = 3000;
      baseValues.turbidity = 20;
    }
    
    // Add some random variation
    const variation = 0.2; // 20% variation
    
    // Generate parameter values
    const paramValues = {
      dissolvedOxygen: Math.max(0, baseValues.dissolvedOxygen + (Math.random() - 0.5) * baseValues.dissolvedOxygen * variation),
      biochemicalOxygenDemand: Math.max(0, baseValues.biochemicalOxygenDemand + (Math.random() - 0.5) * baseValues.biochemicalOxygenDemand * variation),
      nitrate: Math.max(0, baseValues.nitrate + (Math.random() - 0.5) * baseValues.nitrate * variation),
      fecalColiform: Math.max(0, baseValues.fecalColiform + (Math.random() - 0.5) * baseValues.fecalColiform * variation),
      ph: Math.max(0, baseValues.ph + (Math.random() - 0.5) * baseValues.ph * 0.1),
      turbidity: Math.max(0, baseValues.turbidity + (Math.random() - 0.5) * baseValues.turbidity * variation),
      temperature: Math.max(0, baseValues.temperature + (Math.random() - 0.5) * baseValues.temperature * 0.3)
    };
    
    // Create parameters object with status
    const parameters = {
      dissolvedOxygen: {
        value: Number(paramValues.dissolvedOxygen.toFixed(2)),
        unit: 'mg/L',
        status: getParameterStatus(paramValues.dissolvedOxygen, 'dissolvedOxygen')
      },
      biochemicalOxygenDemand: {
        value: Number(paramValues.biochemicalOxygenDemand.toFixed(2)),
        unit: 'mg/L',
        status: getParameterStatus(paramValues.biochemicalOxygenDemand, 'biochemicalOxygenDemand')
      },
      nitrate: {
        value: Number(paramValues.nitrate.toFixed(2)),
        unit: 'mg/L',
        status: getParameterStatus(paramValues.nitrate, 'nitrate')
      },
      fecalColiform: {
        value: Math.round(paramValues.fecalColiform),
        unit: 'MPN/100ml',
        status: getParameterStatus(paramValues.fecalColiform, 'fecalColiform')
      },
      ph: {
        value: Number(paramValues.ph.toFixed(2)),
        unit: 'pH units',
        status: getParameterStatus(paramValues.ph, 'ph')
      },
      temperature: {
        value: Number(paramValues.temperature.toFixed(1)),
        unit: '°C'
      },
      turbidity: {
        value: Number(paramValues.turbidity.toFixed(1)),
        unit: 'NTU',
        status: getParameterStatus(paramValues.turbidity, 'turbidity')
      }
    };
    
    // Calculate WQI and overall status
    const wqi = calculateWQI(parameters);
    let overallStatus = 'excellent';
    if (wqi < 25) overallStatus = 'very_poor';
    else if (wqi < 50) overallStatus = 'poor';
    else if (wqi < 70) overallStatus = 'moderate';
    else if (wqi < 90) overallStatus = 'good';
    
    const reading = {
      locationId: locationId,
      timestamp: date,
      parameters: parameters,
      waterQualityIndex: wqi,
      overallStatus: overallStatus,
      weather: {
        rainfall: Math.random() * 10,
        humidity: 60 + Math.random() * 30,
        windSpeed: Math.random() * 15
      },
      dataSource: 'simulated',
      qualityFlags: {
        validated: Math.random() > 0.3,
        anomaly: Math.random() > 0.9,
        notes: Math.random() > 0.8 ? 'Simulated data for testing' : undefined
      }
    };
    
    data.push(reading);
  }
  
  return data;
}

// Generate alerts based on water quality data
function generateAlerts(waterQualityData, locationsMap) {
  const alerts = [];
  
  waterQualityData.forEach(reading => {
    const { parameters, locationId, timestamp } = reading;
    const location = locationsMap.get(locationId.toString());
    const locationName = location ? location.name : 'Unknown Location';
    
    // Check for various pollution thresholds
    if (parameters.dissolvedOxygen && parameters.dissolvedOxygen.value < 4) {
      alerts.push({
        locationId,
        locationName,
        type: 'pollution',
        severity: 'high',
        title: 'Critical Dissolved Oxygen Level',
        message: `Critical: Dissolved Oxygen level (${parameters.dissolvedOxygen.value} mg/L) below safe threshold at ${locationName}`,
        parameters: { dissolvedOxygen: parameters.dissolvedOxygen.value },
        thresholds: {
          exceeded: 'dissolvedOxygen',
          value: parameters.dissolvedOxygen.value,
          limit: 4
        },
        resolved: Math.random() > 0.7, // 30% chance of being resolved
        priority: 5,
        tags: ['water-quality', 'oxygen', 'critical']
      });
    }
    
    if (parameters.biochemicalOxygenDemand && parameters.biochemicalOxygenDemand.value > 8) {
      alerts.push({
        locationId,
        locationName,
        type: 'pollution',
        severity: 'high',
        title: 'High BOD Level',
        message: `High BOD level (${parameters.biochemicalOxygenDemand.value} mg/L) indicates severe organic pollution at ${locationName}`,
        parameters: { biochemicalOxygenDemand: parameters.biochemicalOxygenDemand.value },
        thresholds: {
          exceeded: 'biochemicalOxygenDemand',
          value: parameters.biochemicalOxygenDemand.value,
          limit: 8
        },
        resolved: Math.random() > 0.6,
        priority: 4,
        tags: ['water-quality', 'bod', 'pollution']
      });
    }
    
    if (parameters.fecalColiform && parameters.fecalColiform.value > 5000) {
      alerts.push({
        locationId,
        locationName,
        type: 'contamination',
        severity: 'critical',
        title: 'Dangerous Fecal Coliform Count',
        message: `Dangerous fecal coliform count (${Math.round(parameters.fecalColiform.value)} CFU/100ml) at ${locationName}`,
        parameters: { fecalColiform: parameters.fecalColiform.value },
        thresholds: {
          exceeded: 'fecalColiform',
          value: parameters.fecalColiform.value,
          limit: 5000
        },
        resolved: Math.random() > 0.8,
        priority: 5,
        tags: ['water-quality', 'contamination', 'critical', 'health-risk']
      });
    }
    
    if (parameters.nitrate && parameters.nitrate.value > 5) {
      alerts.push({
        locationId,
        locationName,
        type: 'pollution',
        severity: 'medium',
        title: 'Elevated Nitrate Levels',
        message: `Elevated nitrate levels (${parameters.nitrate.value} mg/L) detected at ${locationName}`,
        parameters: { nitrate: parameters.nitrate.value },
        thresholds: {
          exceeded: 'nitrate',
          value: parameters.nitrate.value,
          limit: 5
        },
        resolved: Math.random() > 0.5,
        priority: 3,
        tags: ['water-quality', 'nitrate', 'pollution']
      });
    }
    
    if (parameters.ph && (parameters.ph.value < 6.5 || parameters.ph.value > 8.5)) {
      alerts.push({
        locationId,
        locationName,
        type: 'chemical',
        severity: 'medium',
        title: 'pH Level Outside Safe Range',
        message: `pH level (${parameters.ph.value}) outside safe range at ${locationName}`,
        parameters: { ph: parameters.ph.value },
        thresholds: {
          exceeded: 'ph',
          value: parameters.ph.value,
          limit: parameters.ph.value < 6.5 ? 6.5 : 8.5
        },
        resolved: Math.random() > 0.4,
        priority: 3,
        tags: ['water-quality', 'ph', 'chemical']
      });
    }
    
    // Add timestamp to alerts
    alerts.forEach(alert => {
      if (!alert.timestamp) {
        alert.timestamp = timestamp;
      }
    });
  });
  
  return alerts;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Location.deleteMany({});
    await WaterQuality.deleteMany({});
    await Alert.deleteMany({});
    console.log('✅ Cleared existing data');
    
    // Insert locations
    const insertedLocations = await Location.insertMany(locations);
    console.log(`✅ Inserted ${insertedLocations.length} locations`);
    
    // Create a map for quick location lookup
    const locationsMap = new Map();
    insertedLocations.forEach(loc => {
      locationsMap.set(loc._id.toString(), loc);
    });
    
    // Generate and insert water quality data
    let allWaterQualityData = [];
    for (const location of insertedLocations) {
      const locationData = generateWaterQualityData(location._id, location.name, location.type);
      allWaterQualityData = allWaterQualityData.concat(locationData);
    }
    
    await WaterQuality.insertMany(allWaterQualityData);
    console.log(`✅ Inserted ${allWaterQualityData.length} water quality readings`);
    
    // Generate and insert alerts
    const alerts = generateAlerts(allWaterQualityData, locationsMap);
    if (alerts.length > 0) {
      await Alert.insertMany(alerts);
      console.log(`✅ Inserted ${alerts.length} alerts`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${insertedLocations.length} monitoring locations`);
    console.log(`   • ${allWaterQualityData.length} water quality readings`);
    console.log(`   • ${alerts.length} pollution alerts`);
    
    // Display some sample data
    console.log('\n🔍 Sample locations:');
    insertedLocations.slice(0, 3).forEach(loc => {
      console.log(`   • ${loc.name}, ${loc.state} (${loc.coordinates.latitude}, ${loc.coordinates.longitude})`);
    });
    
    // Display sample water quality data
    console.log('\n💧 Sample water quality readings:');
    allWaterQualityData.slice(0, 2).forEach(reading => {
      console.log(`   • ${locationsMap.get(reading.locationId.toString()).name}: WQI ${reading.waterQualityIndex} (${reading.overallStatus})`);
    });
    
    // Display sample alerts
    if (alerts.length > 0) {
      console.log('\n🚨 Sample alerts:');
      alerts.slice(0, 2).forEach(alert => {
        console.log(`   • ${alert.severity.toUpperCase()}: ${alert.title} at ${alert.locationName}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();