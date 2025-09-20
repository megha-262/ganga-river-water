const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Location = require('../models/Location');
const WaterQuality = require('../models/WaterQuality');
const Forecast = require('../models/Forecast');
const Alert = require('../models/Alert');
const SensorData = require('../models/SensorData');

// Connect to database
const connectDB = async () => {
  try {
    const MONGODB_URI = 'mongodb+srv://megha99734_db_user:2dFD4Sgt4Ewr5d1S@cluster0.byca9ck.mongodb.net/river-project?retryWrites=true&w=majority';
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for cleanup...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Clean all collections
async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Delete all documents from each collection
    const collections = [
      { model: Alert, name: 'Alerts' },
      { model: Forecast, name: 'Forecasts' },
      { model: WaterQuality, name: 'Water Quality Records' },
      { model: SensorData, name: 'Sensor Data' },
      { model: Location, name: 'Locations' }
    ];

    for (const collection of collections) {
      const deleteResult = await collection.model.deleteMany({});
      console.log(`✓ Deleted ${deleteResult.deletedCount} ${collection.name}`);
    }

    console.log('✅ Database cleanup completed successfully!');
    console.log('\nDatabase is now clean and ready for fresh seeding.');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed.');
  }
}

// Main execution
async function main() {
  await connectDB();
  await cleanDatabase();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { cleanDatabase, connectDB };