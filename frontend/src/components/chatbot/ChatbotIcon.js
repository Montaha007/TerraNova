import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import './ChatbotIcon.css';

function ChatbotIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m your AI farming assistant. I can help with crop advice, weather planning, pest management, and more. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      const userMessage = { type: 'user', text: inputMessage };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      try {
        const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            system: 'You are a knowledgeable farming assistant. Provide helpful, practical advice about agriculture, crops, weather, soil management, pest control, irrigation, and sustainable farming practices. Keep responses concise but informative.',
            messages: [
              { role: 'user', content: inputMessage }
            ],
          })
        });

        const data = await response.json();
        
        if (data.content && data.content[0]) {
          const botResponse = {
            type: 'bot',
            text: data.content[0].text
          };
          setMessages(prev => [...prev, botResponse]);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = {
          type: 'bot',
          text: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Icon */}
      <div className="chatbot-icon" onClick={toggleChat}>
        <MessageCircle size={24} />
        <span className="chat-tooltip">AI Assistant</span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">
                <img src="/logo/logowhite.png" alt="TerraNova Logo" className="bot-logo" />
              </div>
              <div>
                <h4>Farming AI Assistant</h4>
                <span className="bot-status">Online</span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button onClick={toggleChat} className="chat-action-btn">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="chat-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about farming, crops, weather..."
              className="chat-input-field"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage} 
              className="chat-send-btn"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default ChatbotIcon;