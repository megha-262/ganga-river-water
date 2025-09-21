const { GoogleGenerativeAI } = require('@google/generative-ai');
const WaterQuality = require('../models/WaterQuality');
const Forecast = require('../models/Forecast');
const Alert = require('../models/Alert');
const Location = require('../models/Location');
const Conversation = require('../models/Conversation');

class ChatbotService {
  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyDsvm6dc2OIHVq_6OQ8v7SF1uh2WO7GPho');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async processMessage(message, stationId = null, sessionId = null) {
    try {
      // Get or create conversation
      let conversation = null;
      if (sessionId) {
        conversation = await Conversation.findOne({ sessionId });
        if (!conversation) {
          conversation = new Conversation({ sessionId, messages: [] });
        }
      }

      // Get context data from database
      const context = await this.getContextData(stationId);
      
      // Get conversation history for context
      const conversationHistory = conversation ? conversation.getContext() : [];
      
      // Create system prompt with context and history
      const systemPrompt = this.createSystemPrompt(context, conversationHistory);
      
      // Generate response using Gemini
      const prompt = `${systemPrompt}\n\nUser message: ${message}`;
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Save conversation if sessionId provided
      if (conversation) {
        await conversation.addMessage('user', message, stationId);
        await conversation.addMessage('assistant', text, stationId);
      }

      // Check if response is a JSON action
      if (this.isJsonAction(text)) {
        return { type: 'action', response: text };
      }

      return { type: 'message', response: text };
    } catch (error) {
      console.error('Chatbot service error:', error);
      return { 
        type: 'message', 
        response: 'I apologize, but I encountered an error processing your request. Please try again.' 
      };
    }
  }

  async getContextData(stationId) {
    try {
      const context = {
        readings: [],
        forecast: null,
        alerts: [],
        stationId: stationId
      };

      if (stationId) {
        // Get location info
        const location = await Location.findById(stationId);
        if (location) {
          context.stationName = location.name;
          context.stationLocation = location.location;
        }

        // Get last 10 days of readings
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        
        context.readings = await WaterQuality.find({
          locationId: stationId,
          timestamp: { $gte: tenDaysAgo }
        }).sort({ timestamp: -1 }).limit(10);

        // Get latest forecast
        context.forecast = await Forecast.findOne({
          locationId: stationId
        }).sort({ forecastDate: -1 });

        // Get active alerts
        context.alerts = await Alert.find({
          locationId: stationId,
          status: 'active'
        }).sort({ timestamp: -1 });
      } else {
        // Get general data if no specific station
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        context.readings = await WaterQuality.find({
          timestamp: { $gte: oneDayAgo }
        }).sort({ timestamp: -1 }).limit(20);

        context.alerts = await Alert.find({
          status: 'active'
        }).sort({ timestamp: -1 }).limit(10);
      }

      return context;
    } catch (error) {
      console.error('Error getting context data:', error);
      return { readings: [], forecast: null, alerts: [], stationId: null };
    }
  }

  createSystemPrompt(context, conversationHistory = []) {
    const { readings, forecast, alerts, stationId, stationName } = context;
    
    let prompt = `You are the AI chatbot for the Ganga River Water Quality Monitoring web app.

GUIDELINES:
- For specific data queries, use the database/context data provided below. Do not invent specific numbers or data.
- You can answer general questions about Ganga River, water quality concepts, pollution, environmental topics, and related subjects using your knowledge.
- When asked about a specific station, summarize last 10 days and next 3-day forecast if data is available.
- If active alerts exist, explicitly state them and suggest simple actions (acknowledge/escalate).
- If user requests to acknowledge an alert, reply ONLY with JSON: {"action":"acknowledge","alertId":"<id>"}
- If no data for requested station, reply: "No data available for that station."
- Keep tone factual and helpful. Be concise (1–3 sentences) unless user asks for details.
- You can discuss water quality parameters (DO, BOD, pH, etc.), their significance, pollution causes, and environmental impacts.
- Only decline to answer if the question is completely unrelated to water quality, environment, rivers, or the Ganga monitoring system.
- Use the conversation history below to maintain context and provide relevant follow-up responses.

CONVERSATION HISTORY:`;

    // Add conversation history if available
    if (conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        prompt += `\n${msg.role}: ${msg.content}`;
      });
    } else {
      prompt += '\nNo previous conversation.';
    }

    prompt += '\n\nCURRENT CONTEXT DATA:';

    if (stationId && stationName) {
      prompt += `\nStation: ${stationName} (ID: ${stationId})`;
    }

    if (readings && readings.length > 0) {
      prompt += `\n\nRECENT READINGS (Last 10 days):`;
      readings.forEach((reading, index) => {
        const date = reading.timestamp.toISOString().split('T')[0];
        prompt += `\n${index + 1}. ${date}: DO=${reading.dissolvedOxygen}mg/L, BOD=${reading.biochemicalOxygenDemand}mg/L, pH=${reading.ph}, WQI=${reading.waterQualityIndex}`;
      });
      
      // Calculate averages
      const avgDO = (readings.reduce((sum, r) => sum + r.dissolvedOxygen, 0) / readings.length).toFixed(1);
      const avgBOD = (readings.reduce((sum, r) => sum + r.biochemicalOxygenDemand, 0) / readings.length).toFixed(1);
      const avgPH = (readings.reduce((sum, r) => sum + r.ph, 0) / readings.length).toFixed(1);
      const avgWQI = (readings.reduce((sum, r) => sum + r.waterQualityIndex, 0) / readings.length).toFixed(0);
      
      prompt += `\n\nAVERAGES (Last 10 days): DO=${avgDO}mg/L, BOD=${avgBOD}mg/L, pH=${avgPH}, WQI=${avgWQI}`;
    }

    if (forecast) {
      prompt += `\n\nFORECAST (Next 3 days):`;
      if (forecast.predictions && forecast.predictions.length > 0) {
        forecast.predictions.slice(0, 3).forEach((pred, index) => {
          const date = new Date(pred.date).toISOString().split('T')[0];
          prompt += `\n${index + 1}. ${date}: DO=${pred.dissolvedOxygen}mg/L, BOD=${pred.biochemicalOxygenDemand}mg/L, pH=${pred.ph}, WQI=${pred.waterQualityIndex}`;
        });
      }
    }

    if (alerts && alerts.length > 0) {
      prompt += `\n\nACTIVE ALERTS:`;
      alerts.forEach((alert, index) => {
        prompt += `\n${index + 1}. Alert ID: ${alert._id}, Type: ${alert.type}, Severity: ${alert.severity}, Message: ${alert.message}`;
      });
    }

    if (!readings || readings.length === 0) {
      prompt += `\n\nNo recent readings available.`;
    }

    return prompt;
  }

  isJsonAction(text) {
    try {
      const trimmed = text.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        return parsed.action && parsed.alertId;
      }
      return false;
    } catch {
      return false;
    }
  }
}

module.exports = new ChatbotService();