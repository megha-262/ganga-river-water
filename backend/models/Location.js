const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    default: 'Uttar Pradesh'
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  riverKm: {
    type: Number,
    required: true,
    description: 'Distance from Gangotri in kilometers'
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  installationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Index for river kilometer for sorting
locationSchema.index({ riverKm: 1 });

module.exports = mongoose.model('Location', locationSchema);