import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendar, FaRuler, FaSeedling, FaAppleAlt, FaCarrot, FaLeaf, FaTree, FaTint, FaThermometerHalf, FaWind } from 'react-icons/fa';
import { GiWheat, GiGrapes, GiOlive, GiPotato, GiOrange, GiPalmTree } from 'react-icons/gi';
import './FieldCard.css';

// Crop icon mapping
const cropIcons = {
  tomato: GiOrange,
  olives: GiOlive,
  wheat: GiWheat,
  potato: GiPotato,
  citrus: GiOrange,
  dates: GiPalmTree,
  grapes: GiGrapes,
  vegetables: FaLeaf,
  other: FaSeedling
};

// Status badge colors
const statusColors = {
  active: { bg: '#d4edda', color: '#155724', label: 'Active' },
  fallow: { bg: '#fff3cd', color: '#856404', label: 'Fallow' },
  preparation: { bg: '#d1ecf1', color: '#0c5460', label: 'Preparation' },
  harvested: { bg: '#f8d7da', color: '#721c24', label: 'Harvested' }
};

// Generate consistent random sensor data based on field ID
const generateSensorData = (fieldId) => {
  const seed = fieldId;
  const moisture = 45 + (seed % 30);
  const temperature = 18 + (seed % 10);
  const humidity = 55 + (seed % 25);
  
  return { moisture, temperature, humidity };
};

function FieldCard({ field }) {
  const navigate = useNavigate();
  const sensorData = generateSensorData(field.id);
  
  // Format planting date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const cropIcon = cropIcons[field.crop_type?.toLowerCase()] || cropIcons.other;
  const statusStyle = statusColors[field.status?.toLowerCase()] || statusColors.active;

  const CropIcon = cropIcon;

  return (
    <div className="field-card">
      <div className="field-card-header">
        <div className="field-crop-icon"><CropIcon /></div>
        <div className="field-header-info">
          <h3 className="field-name">{field.name}</h3>
          <span 
            className="field-status-badge"
            style={{ 
              backgroundColor: statusStyle.bg, 
              color: statusStyle.color 
            }}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>

      <div className="field-details">
        <div className="field-detail-item">
          <FaRuler className="detail-icon" />
          <span>{field.area_size ? `${field.area_size.toFixed(2)} ha` : 'N/A'}</span>
        </div>
        <div className="field-detail-item">
          <FaCalendar className="detail-icon" />
          <span>{formatDate(field.planting_date)}</span>
        </div>
      </div>

      <div className="field-crop-info">
        <span className="crop-label">Crop:</span>
        <span className="crop-value">{field.crop_type || 'Unknown'}</span>
      </div>

      {/* TODO: Replace with real IoT data */}
      <div className="field-sensors">
        <div className="sensor-item">
          <FaTint className="sensor-icon" />
          <div className="sensor-info">
            <span className="sensor-value">{sensorData.moisture}%</span>
            <span className="sensor-label">Moisture</span>
          </div>
        </div>
        <div className="sensor-item">
          <FaThermometerHalf className="sensor-icon" />
          <div className="sensor-info">
            <span className="sensor-value">{sensorData.temperature}°C</span>
            <span className="sensor-label">Temp</span>
          </div>
        </div>
        <div className="sensor-item">
          <FaWind className="sensor-icon" />
          <div className="sensor-info">
            <span className="sensor-value">{sensorData.humidity}%</span>
            <span className="sensor-label">Humidity</span>
          </div>
        </div>
      </div>

      <button 
        className="view-map-btn"
        onClick={() => navigate('/map')}
      >
        <FaMapMarkerAlt />
        View on Map
      </button>
    </div>
  );
}

export default FieldCard;
