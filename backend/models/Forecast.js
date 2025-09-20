const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  forecastDate: {
    type: Date,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  // Forecast for next 3 days
  predictions: [{
    date: {
      type: Date,
      required: true
    },
    dayOffset: {
      type: Number,
      required: true,
      min: 1,
      max: 3
    },
    parameters: {
      dissolvedOxygen: {
        predicted: { type: Number, required: true },
        confidence: { type: Number, min: 0, max: 100, default: 75 },
        trend: { type: String, enum: ['improving', 'stable', 'declining'], required: true }
      },
      biochemicalOxygenDemand: {
        predicted: { type: Number, required: true },
        confidence: { type: Number, min: 0, max: 100, default: 75 },
        trend: { type: String, enum: ['improving', 'stable', 'declining'], required: true }
      },
      nitrate: {
        predicted: { type: Number, required: true },
        confidence: { type: Number, min: 0, max: 100, default: 75 },
        trend: { type: String, enum: ['improving', 'stable', 'declining'], required: true }
      },
      fecalColiform: {
        predicted: { type: Number, required: true },
        confidence: { type: Number, min: 0, max: 100, default: 75 },
        trend: { type: String, enum: ['improving', 'stable', 'declining'], required: true }
      }
    },
    predictedWQI: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    predictedStatus: {
      type: String,
      enum: ['excellent', 'good', 'moderate', 'poor', 'very_poor'],
      required: true
    },
    // Expected weather conditions
    expectedWeather: {
      rainfall: { type: Number, default: 0 },
      temperature: { type: Number },
      humidity: { type: Number }
    }
  }],
  // Model information
  modelInfo: {
    algorithm: {
      type: String,
      default: 'rule-based',
      enum: ['rule-based', 'linear-regression', 'arima', 'neural-network']
    },
    version: {
      type: String,
      default: '1.0'
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    }
  },
  // Alerts for forecast period
  forecastAlerts: [{
    day: { type: Number, min: 1, max: 3 },
    parameter: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    message: { type: String, required: true }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
forecastSchema.index({ locationId: 1, forecastDate: -1 });
forecastSchema.index({ generatedAt: -1 });
forecastSchema.index({ 'predictions.date': 1 });

// Method to get forecast for specific day
forecastSchema.methods.getForecastForDay = function(dayOffset) {
  return this.predictions.find(p => p.dayOffset === dayOffset);
};

// Method to check if forecast has any alerts
forecastSchema.methods.hasAlerts = function() {
  return this.forecastAlerts.length > 0;
};

module.exports = mongoose.model('Forecast', forecastSchema);