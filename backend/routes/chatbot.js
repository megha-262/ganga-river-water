const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');
const Conversation = require('../models/Conversation');

// POST /api/chatbot/message
router.post('/message', async (req, res) => {
  try {
    const { message, stationId, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string'
      });
    }

    const response = await chatbotService.processMessage(message.trim(), stationId, sessionId);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Chatbot route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/chatbot/conversation/:sessionId
router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const conversation = await Conversation.findOne({ sessionId });
    
    if (!conversation) {
      return res.json({
        success: true,
        data: {
          sessionId,
          messages: []
        }
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: conversation.sessionId,
        messages: conversation.messages,
        lastActivity: conversation.lastActivity
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/chatbot/conversation/:sessionId
router.delete('/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await Conversation.deleteOne({ sessionId });
    
    res.json({
      success: true,
      message: 'Conversation cleared successfully'
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chatbot service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;