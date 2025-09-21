import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const navigate = useNavigate();

  const handleChatbotClick = () => {
    navigate('/chatbot');
  };

  return (
    <button
      onClick={handleChatbotClick}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-50 group"
      aria-label="Open chatbot"
      title="Chat with Ganga Water Quality Assistant"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chat Assistant
      </span>
    </button>
  );
};

export default Chatbot;