import React from 'react';
import './MapToolbar.css';

function MapToolbar({ mode, onModeChange }) {
  return (
    <div className="map-toolbar">
      <button
        className={`toolbar-btn ${mode === 'view' ? 'active' : ''}`}
        onClick={() => onModeChange('view')}
        title="View Only Mode"
      >
        <span className="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </span>
        <span className="btn-text">View Only</span>
      </button>

      <button
        className={`toolbar-btn ${mode === 'field' ? 'active' : ''}`}
        onClick={() => onModeChange('field')}
        title="Draw Field Boundaries"
      >
        <span className="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </span>
        <span className="btn-text">Add Field</span>
      </button>

      <button
        className={`toolbar-btn ${mode === 'camera' ? 'active' : ''}`}
        onClick={() => onModeChange('camera')}
        title="Place Camera"
      >
        <span className="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </span>
        <span className="btn-text">Add Camera</span>
      </button>

      <div className="mode-indicator">
        <span className="indicator-label">Mode:</span>
        <span className="indicator-value">
          {mode === 'view' && 'Viewing'}
          {mode === 'field' && 'Drawing Field'}
          {mode === 'camera' && 'Placing Camera'}
        </span>
      </div>
    </div>
  );
}

export default MapToolbar;
