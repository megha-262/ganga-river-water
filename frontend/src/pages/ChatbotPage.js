import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  MapPin, 
  RefreshCw,
  Trash2,
  AlertCircle,
  Info,
  Sparkles,
  Zap,
  BarChart3,
  Droplets
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import { Badge } from '../components/ui';
import { Alert, AlertTitle, AlertDescription } from '../components/ui';
import { apiService } from '../services/api';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState('');
  const [stations, setStations] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Load stations
  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await apiService.getLocations();
        setStations(response.data || []);
      } catch (error) {
        console.error('Error loading stations:', error);
      }
    };
    loadStations();
  }, []);

  // Load conversation history when sessionId is set
  useEffect(() => {
    if (sessionId) {
      loadConversationHistory();
    }
  }, [sessionId]);

  // Auto-scroll to bottom when messages change (only for new messages)
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll]);

  const loadConversationHistory = async () => {
    try {
      const data = await apiService.chatbot.getConversation(sessionId);
      
      if (data.success && data.data.messages) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = messageText.trim();
    setInputMessage('');
    setError(null);

    // Add user message to UI immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      stationId: selectedStation || null
    };
    setMessages(prev => [...prev, newUserMessage]);
    setShouldAutoScroll(true);
    setIsLoading(true);

    try {
      const data = await apiService.chatbot.sendMessage(
        userMessage,
        sessionId,
        selectedStation || null
      );

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          stationId: selectedStation || null
        };
        setMessages(prev => [...prev, assistantMessage]);
        setShouldAutoScroll(true);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your message. Please try again.',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        setShouldAutoScroll(true);
        setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputMessage);
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = async () => {
    try {
      await apiService.chatbot.clearConversation(sessionId);
      setMessages([]);
      setError(null);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const getSelectedStationName = () => {
    if (!selectedStation) return 'All Stations';
    const station = stations.find(s => s._id === selectedStation);
    return station ? station.name : 'Unknown Station';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickQuestions = [
    {
      icon: Droplets,
      text: "What's the current water quality?",
      color: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
    },
    {
      icon: AlertCircle,
      text: "Show me recent alerts",
      color: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
    },
    {
      icon: BarChart3,
      text: "Explain BOD levels",
      color: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
    },
    {
      icon: Info,
      text: "What causes water pollution?",
      color: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
    }
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Simplified Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Water Quality Assistant</h1>
                <p className="text-xs text-gray-500">Ask me about Ganga River monitoring</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
              {messages.length} messages
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sticky Sidebar */}
        <div className="hidden md:block w-80 lg:w-80 md:w-72 flex-shrink-0 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-sm overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Station Selector */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-sm font-medium">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Stations</option>
                  {stations.map((station) => (
                    <option key={station._id} value={station._id}>
                      {station.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                  <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                  {getSelectedStationName()}
                </div>
              </CardContent>
            </Card>

            {/* Quick Questions */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-sm font-medium">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                  Quick Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => {
                  const IconComponent = question.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className={`w-full text-left justify-start h-auto p-3 text-xs border transition-all duration-200 ${question.color}`}
                      onClick={() => handleQuickQuestion(question.text)}
                      disabled={isLoading}
                    >
                      <IconComponent className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="font-medium">{question.text}</span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Session Info & Controls */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-sm font-medium">
                  <Bot className="h-4 w-4 mr-2 text-green-600" />
                  Chat Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-gray-600">
                  <div className="flex items-center mb-1">
                    <Info className="h-3 w-3 mr-1 text-blue-500" />
                    Session ID
                  </div>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded-md break-all">
                    {sessionId.slice(-12)}...
                  </div>
                </div>
                
                <Button
                  onClick={clearConversation}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 text-xs"
                  disabled={messages.length === 0}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
          {/* Error Alert */}
          {error && (
            <Alert className="m-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-8 rounded-2xl mb-6 max-w-md">
                  <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Welcome to your Water Quality Assistant!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    I'm here to help you understand water quality data, alerts, and pollution levels. 
                    Ask me anything or try one of the quick questions.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-white text-gray-800 border border-gray-200 shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {message.role === 'assistant' && (
                        <div className={`p-2 rounded-full ${
                          message.isError ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <Bot className={`h-4 w-4 ${
                            message.isError ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                      )}
                      {message.role === 'user' && (
                        <div className="p-2 rounded-full bg-white/20">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 opacity-70 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-4 max-w-[80%] border border-gray-200 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t bg-white/80 backdrop-blur-sm p-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about water quality, pollution, or monitoring data..."
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white shadow-sm text-sm"
                  rows="1"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;