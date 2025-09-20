const mongoose = require('mongoose');
require('dotenv').config();

// Import models and seed functions
const Location = require('../models/Location');
const { seedAlerts, seedLocations } = require('../data/seedData');

// Connect to database
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for adding sample alerts...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Main function to add sample alerts
async function addSampleAlerts() {
  try {
    await connectDB();
    
    // Check if locations exist
    let locations = await Location.find({});
    
    if (locations.length === 0) {
      console.log('No locations found. Creating sample locations first...');
      locations = await seedLocations();
    }
    
    console.log(`Found ${locations.length} locations. Adding sample alerts...`);
    
    // Add sample alerts
    const alerts = await seedAlerts(locations);
    
    console.log(`✅ Successfully added ${alerts.length} sample alerts to the database!`);
    console.log('Sample alerts include:');
    console.log('- Pollution alerts');
    console.log('- Contamination alerts');
    console.log('- Chemical parameter violations');
    console.log('- Biological oxygen demand alerts');
    console.log('- Physical parameter alerts');
    console.log('');
    console.log('Alert levels range from 1 (Normal) to 5 (Emergency)');
    console.log('You can now view these alerts in the frontend at /alerts');
    
  } catch (error) {
    console.error('Error adding sample alerts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

// Run the script
if (require.main === module) {
  addSampleAlerts();
}

module.exports = addSampleAlerts;