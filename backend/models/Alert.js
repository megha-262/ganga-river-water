const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  locationName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['pollution', 'contamination', 'chemical', 'biological', 'physical', 'system'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  thresholds: {
    exceeded: { type: String },
    value: { type: Number },
    limit: { type: Number }
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false_positive'],
    default: 'active'
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: String
  },
  acknowledgedAt: {
    type: Date
  },
  acknowledgedBy: {
    type: String
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  source: {
    type: String,
    enum: ['automated', 'manual', 'system'],
    default: 'automated'
  },
  actions: [{
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    user: { type: String },
    notes: { type: String }
  }],
  tags: [String],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
alertSchema.index({ locationId: 1, createdAt: -1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ type: 1, createdAt: -1 });
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ resolved: 1, createdAt: -1 });

// Virtual for alert age
alertSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Method to resolve alert
alertSchema.methods.resolve = function(resolvedBy, notes) {
  this.resolved = true;
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  
  if (notes) {
    this.actions.push({
      action: 'resolved',
      user: resolvedBy,
      notes: notes
    });
  }
  
  return this.save();
};

// Method to acknowledge alert
alertSchema.methods.acknowledge = function(acknowledgedBy, notes) {
  this.status = 'acknowledged';
  this.acknowledgedAt = new Date();
  this.acknowledgedBy = acknowledgedBy;
  
  if (notes) {
    this.actions.push({
      action: 'acknowledged',
      user: acknowledgedBy,
      notes: notes
    });
  }
  
  return this.save();
};

// Static method to get active alerts count
alertSchema.statics.getActiveCount = function() {
  return this.countDocuments({ resolved: false });
};

// Static method to get alerts by severity
alertSchema.statics.getBySeverity = function(severity) {
  return this.find({ severity: severity, resolved: false }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Alert', alertSchema);