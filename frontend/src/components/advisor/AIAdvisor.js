import React, { useState, useEffect } from 'react';
import { 
  FaBrain, 
  FaSeedling, 
  FaCloudSun, 
  FaChartLine, 
  FaLightbulb,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaSpinner,
  FaRobot
} from 'react-icons/fa';
import './AIAdvisor.css';

function AIAdvisor() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const categories = [
    { id: 'all', name: 'All Recommendations', icon: FaBrain },
    { id: 'planting', name: 'Planting', icon: FaSeedling },
    { id: 'weather', name: 'Weather', icon: FaCloudSun },
    { id: 'harvest', name: 'Harvest', icon: FaChartLine },
    { id: 'general', name: 'General', icon: FaLightbulb }
  ];

  useEffect(() => {
    // Mock AI recommendations
    const mockRecommendations = [
      {
        id: 1,
        category: 'planting',
        priority: 'high',
        title: 'Optimal Planting Window for Tomatoes',
        description: 'Based on current weather patterns and soil conditions, the next 7 days present an ideal opportunity for planting tomatoes in your North Field.',
        actionItems: [
          'Prepare soil with organic compost',
          'Ensure soil pH is between 6.0-6.8',
          'Plant seedlings 18-24 inches apart',
          'Apply mulch after planting'
        ],
        confidence: 92,
        timeframe: 'Next 7 days',
        impact: 'High - Expected 15-20% yield increase'
      },
      {
        id: 2,
        category: 'weather',
        priority: 'medium',
        title: 'Incoming Rainfall Alert',
        description: 'Weather models predict 40mm of rainfall over the next 48 hours. Consider adjusting irrigation schedules.',
        actionItems: [
          'Reduce irrigation by 50% tomorrow',
          'Check drainage systems',
          'Postpone fertilizer application',
          'Cover sensitive crops if possible'
        ],
        confidence: 85,
        timeframe: '48 hours',
        impact: 'Medium - Prevents waterlogging'
      },
      {
        id: 3,
        category: 'harvest',
        priority: 'low',
        title: 'Harvest Timing for Wheat',
        description: 'Your wheat crop in South Field is approaching optimal harvest time. Current moisture levels are ideal.',
        actionItems: [
          'Test grain moisture content (target: 13-14%)',
          'Prepare harvesting equipment',
          'Schedule labor for next week',
          'Plan storage requirements'
        ],
        confidence: 78,
        timeframe: '5-7 days',
        impact: 'High - Maximizes grain quality'
      },
      {
        id: 4,
        category: 'general',
        priority: 'medium',
        title: 'Soil Health Improvement',
        description: 'Soil analysis indicates nitrogen deficiency in East Field. Consider crop rotation or fertilization.',
        actionItems: [
          'Apply nitrogen-rich fertilizer (NPK 20-10-10)',
          'Plant legumes in next rotation',
          'Add organic matter to soil',
          'Monitor plant response for 2 weeks'
        ],
        confidence: 88,
        timeframe: '2 weeks',
        impact: 'Medium - Improves long-term soil fertility'
      }
    ];

    setRecommendations(mockRecommendations);
  }, []);

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <FaExclamationTriangle className="priority-icon-high" />;
      case 'medium': return <FaInfoCircle className="priority-icon-medium" />;
      case 'low': return <FaCheckCircle className="priority-icon-low" />;
      default: return <FaInfoCircle />;
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages([...chatMessages, newMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: `I understand you're asking about "${currentMessage}". Based on your farm's current conditions and the latest agricultural data, I recommend checking soil moisture levels before making any decisions. Would you like me to provide more specific guidance?`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateNewRecommendations = () => {
    setLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const newRec = {
        id: recommendations.length + 1,
        category: 'general',
        priority: 'medium',
        title: 'New AI Analysis Complete',
        description: 'Based on your latest farm data, I\'ve identified opportunities to optimize water usage and improve crop yields.',
        actionItems: [
          'Review detailed analysis report',
          'Implement suggested changes gradually',
          'Monitor results for 2-3 weeks'
        ],
        confidence: 90,
        timeframe: 'This month',
        impact: 'High - Potential 10-15% improvement'
      };
      
      setRecommendations([...recommendations, newRec]);
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="ai-advisor">
      <div className="advisor-header">
        <div className="header-content">
          <h1><FaBrain /> AI Farming Advisor</h1>
          <p>Get personalized farming recommendations powered by artificial intelligence</p>
        </div>
        <button 
          className="generate-btn"
          onClick={generateNewRecommendations}
          disabled={loading}
        >
          {loading ? <FaSpinner className="spinner" /> : <FaRobot />}
          {loading ? 'Analyzing...' : 'Generate New Insights'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <div className="filter-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <category.icon />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="recommendations-section">
        <h2>Personalized Recommendations</h2>
        <div className="recommendations-grid">
          {filteredRecommendations.map(rec => (
            <div key={rec.id} className={`recommendation-card ${getPriorityColor(rec.priority)}`}>
              <div className="rec-header">
                <div className="rec-title">
                  <h3>{rec.title}</h3>
                  <div className="rec-meta">
                    <span className={`priority-badge ${getPriorityColor(rec.priority)}`}>
                      {getPriorityIcon(rec.priority)}
                      {rec.priority} priority
                    </span>
                    <span className="confidence">
                      {rec.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="rec-content">
                <p>{rec.description}</p>
                
                <div className="action-items">
                  <h4>Recommended Actions:</h4>
                  <ul>
                    {rec.actionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rec-footer">
                  <div className="timeframe">
                    <FaCalendarAlt />
                    <span>{rec.timeframe}</span>
                  </div>
                  <div className="impact">
                    <span>{rec.impact}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Chat Interface */}
      <div className="chat-section">
        <h2>Ask AI Assistant</h2>
        <div className="chat-container">
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-welcome">
                <FaRobot className="welcome-icon" />
                <h3>Ask me anything about your farm!</h3>
                <p>I can help with crop recommendations, weather analysis, soil health, and more.</p>
              </div>
            ) : (
              chatMessages.map(message => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="timestamp">{message.timestamp}</span>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="message ai typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about crop recommendations, weather, soil health..."
              disabled={isTyping}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isTyping}
            >
              <FaBrain />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAdvisor;