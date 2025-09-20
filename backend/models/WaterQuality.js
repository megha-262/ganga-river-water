const mongoose = require('mongoose');

const waterQualitySchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  parameters: {
    // Dissolved Oxygen (mg/L)
    dissolvedOxygen: {
      value: { type: Number, required: true, min: 0, max: 20 },
      unit: { type: String, default: 'mg/L' },
      status: { type: String, enum: ['good', 'moderate', 'poor'], required: true }
    },
    // Biochemical Oxygen Demand (mg/L)
    biochemicalOxygenDemand: {
      value: { type: Number, required: true, min: 0, max: 50 },
      unit: { type: String, default: 'mg/L' },
      status: { type: String, enum: ['good', 'moderate', 'poor'], required: true }
    },
    // Nitrate (mg/L)
    nitrate: {
      value: { type: Number, required: true, min: 0, max: 100 },
      unit: { type: String, default: 'mg/L' },
      status: { type: String, enum: ['good', 'moderate', 'poor'], required: true }
    },
    // Fecal Coliform (MPN/100ml)
    fecalColiform: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, default: 'MPN/100ml' },
      status: { type: String, enum: ['good', 'moderate', 'poor'], required: true }
    },
    // pH
    ph: {
      value: { type: Number, required: true, min: 0, max: 14 },
      unit: { type: String, default: 'pH units' },
      status: { type: String, enum: ['good', 'moderate', 'poor'], required: true }
    },
    // Temperature (°C)
    temperature: {
      value: { type: Number, required: true, min: -10, max: 50 },
      unit: { type: String, default: '°C' }
    },
    // Turbidity (NTU)
    turbidity: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, default: 'NTU' },
      status: { type: String, enum: ['good', 'moderate', 'poor'], required: true }
    }
  },
  // Overall water quality index (0-100)
  waterQualityIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Overall status based on WQI
  overallStatus: {
    type: String,
    enum: ['excellent', 'good', 'moderate', 'poor', 'very_poor'],
    required: true
  },
  // Weather conditions
  weather: {
    rainfall: { type: Number, default: 0, min: 0 }, // mm
    humidity: { type: Number, min: 0, max: 100 }, // %
    windSpeed: { type: Number, min: 0 } // km/h
  },
  // Data source
  dataSource: {
    type: String,
    enum: ['sensor', 'manual', 'simulated'],
    default: 'simulated'
  },
  // Quality control flags
  qualityFlags: {
    validated: { type: Boolean, default: false },
    anomaly: { type: Boolean, default: false },
    notes: { type: String }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
waterQualitySchema.index({ locationId: 1, timestamp: -1 });
waterQualitySchema.index({ timestamp: -1 });
waterQualitySchema.index({ 'parameters.dissolvedOxygen.status': 1 });
waterQualitySchema.index({ overallStatus: 1 });

// Virtual for getting date without time
waterQualitySchema.virtual('date').get(function() {
  return this.timestamp.toISOString().split('T')[0];
});

// Method to check if any parameter is in poor condition
waterQualitySchema.methods.hasAlerts = function() {
  const params = this.parameters;
  return params.dissolvedOxygen.status === 'poor' ||
         params.biochemicalOxygenDemand.status === 'poor' ||
         params.nitrate.status === 'poor' ||
         params.fecalColiform.status === 'poor' ||
         params.ph.status === 'poor' ||
         params.turbidity.status === 'poor';
};

module.exports = mongoose.model('WaterQuality', waterQualitySchema);