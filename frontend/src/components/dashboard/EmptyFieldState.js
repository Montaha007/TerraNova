import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMap } from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import './EmptyFieldState.css';

function EmptyFieldState() {
  const navigate = useNavigate();

  return (
    <div className="empty-state">
      <div className="empty-icon"><GiWheat /></div>
      <h3>No Fields Yet</h3>
      <p>Start by adding fields to your farm on the map</p>
      <button 
        className="empty-state-btn"
        onClick={() => navigate('/map')}
      >
        <FaMap />
        Go to Map
      </button>
    </div>
  );
}

export default EmptyFieldState;
