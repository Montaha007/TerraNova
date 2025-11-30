import React from 'react';
import { FaRocket, FaTools } from 'react-icons/fa';
import './PlaceholderPage.css';

function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <div className="placeholder-icon">
          <FaRocket />
        </div>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-description">
          {description || 'This feature is coming soon...'}
        </p>
        <div className="placeholder-tools">
          <FaTools />
          <span>Under Development</span>
        </div>
        <div className="placeholder-features">
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Smart Features</h3>
            <p>Advanced AI-powered capabilities</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Data</h3>
            <p>Live monitoring and analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Notifications</h3>
            <p>Stay updated with alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;
