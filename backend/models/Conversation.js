const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  }
});

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
conversationSchema.index({ sessionId: 1 });
conversationSchema.index({ lastActivity: -1 });

// Middleware to update lastActivity on save
conversationSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Method to add a message and maintain last 5 conversations limit
conversationSchema.methods.addMessage = function(role, content, stationId = null) {
  this.messages.push({
    role,
    content,
    stationId,
    timestamp: new Date()
  });
  
  // Keep only last 10 messages (5 conversations = 10 messages)
  if (this.messages.length > 10) {
    this.messages = this.messages.slice(-10);
  }
  
  return this.save();
};

// Method to get conversation context for AI
conversationSchema.methods.getContext = function() {
  return this.messages.slice(-10).map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp
  }));
};

module.exports = mongoose.model('Conversation', conversationSchema);