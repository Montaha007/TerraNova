import React, { useState, useEffect } from 'react';
import { 
  FaThermometerHalf, 
  FaTint, 
  FaSun, 
  FaWind, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaWifi,
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter
} from 'react-icons/fa';
import './IoTMonitoring.css';

function IoTMonitoring() {
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  // Mock sensor data
  useEffect(() => {
    const mockSensors = [
      {
        id: 1,
        name: 'Greenhouse Sensor 1',
        location: 'North Field',
        status: 'online',
        battery: 85,
        lastUpdate: '2 mins ago',
        temperature: 24.5,
        humidity: 65,
        soilMoisture: 72,
        lightLevel: 850,
        windSpeed: 12
      },
      {
        id: 2,
        name: 'Greenhouse Sensor 2',
        location: 'South Field',
        status: 'online',
        battery: 42,
        lastUpdate: '5 mins ago',
        temperature: 26.2,
        humidity: 58,
        soilMoisture: 68,
        lightLevel: 920,
        windSpeed: 8
      },
      {
        id: 3,
        name: 'Irrigation Sensor',
        location: 'Main Irrigation',
        status: 'offline',
        battery: 15,
        lastUpdate: '2 hours ago',
        temperature: 22.1,
        humidity: 70,
        soilMoisture: 45,
        lightLevel: 650,
        windSpeed: 15
      }
    ];

    const mockAlerts = [
      {
        id: 1,
        type: 'warning',
        message: 'Low soil moisture in South Field',
        sensor: 'Greenhouse Sensor 2',
        time: '15 mins ago',
        severity: 'medium'
      },
      {
        id: 2,
        type: 'error',
        message: 'Irrigation Sensor offline',
        sensor: 'Irrigation Sensor',
        time: '2 hours ago',
        severity: 'high'
      },
      {
        id: 3,
        type: 'info',
        message: 'Optimal conditions in North Field',
        sensor: 'Greenhouse Sensor 1',
        time: '1 hour ago',
        severity: 'low'
      }
    ];

    setSensorData(mockSensors);
    setAlerts(mockAlerts);
  }, []);

  const getBatteryIcon = (level) => {
    if (level > 75) return <FaBatteryFull className="battery-good" />;
    if (level > 50) return <FaBatteryThreeQuarters className="battery-good" />;
    if (level > 25) return <FaBatteryHalf className="battery-medium" />;
    return <FaBatteryQuarter className="battery-low" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'status-online';
      case 'offline': return 'status-offline';
      case 'warning': return 'status-warning';
      default: return 'status-unknown';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <FaExclamationTriangle className="alert-error" />;
      case 'warning': return <FaExclamationTriangle className="alert-warning" />;
      case 'info': return <FaCheckCircle className="alert-info" />;
      default: return <FaExclamationTriangle />;
    }
  };

  return (
    <div className="iot-monitoring">
      <div className="iot-header">
        <h1>IoT Monitoring</h1>
        <p>Real-time monitoring of your farm sensors and environmental conditions</p>
        
        <div className="controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="alerts-section">
        <h2>Active Alerts</h2>
        <div className="alerts-grid">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-card alert-${alert.severity}`}>
              <div className="alert-header">
                {getAlertIcon(alert.type)}
                <span className="alert-time">{alert.time}</span>
              </div>
              <div className="alert-content">
                <h4>{alert.message}</h4>
                <p>Sensor: {alert.sensor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="sensors-section">
        <h2>Sensor Network</h2>
        <div className="sensors-grid">
          {sensorData.map(sensor => (
            <div 
              key={sensor.id} 
              className={`sensor-card ${selectedSensor?.id === sensor.id ? 'selected' : ''}`}
              onClick={() => setSelectedSensor(sensor)}
            >
              <div className="sensor-header">
                <div className="sensor-info">
                  <h3>{sensor.name}</h3>
                  <p>{sensor.location}</p>
                </div>
                <div className="sensor-status">
                  <div className={`status-indicator ${getStatusColor(sensor.status)}`}></div>
                  <span>{sensor.status}</span>
                </div>
              </div>

              <div className="sensor-metrics">
                <div className="metric">
                  <FaThermometerHalf className="metric-icon temperature" />
                  <div className="metric-data">
                    <span className="metric-value">{sensor.temperature}°C</span>
                    <span className="metric-label">Temperature</span>
                  </div>
                </div>

                <div className="metric">
                  <FaTint className="metric-icon humidity" />
                  <div className="metric-data">
                    <span className="metric-value">{sensor.humidity}%</span>
                    <span className="metric-label">Humidity</span>
                  </div>
                </div>

                <div className="metric">
                  <FaTint className="metric-icon moisture" />
                  <div className="metric-data">
                    <span className="metric-value">{sensor.soilMoisture}%</span>
                    <span className="metric-label">Soil Moisture</span>
                  </div>
                </div>

                <div className="metric">
                  <FaSun className="metric-icon light" />
                  <div className="metric-data">
                    <span className="metric-value">{sensor.lightLevel}</span>
                    <span className="metric-label">Light Level</span>
                  </div>
                </div>

                <div className="metric">
                  <FaWind className="metric-icon wind" />
                  <div className="metric-data">
                    <span className="metric-value">{sensor.windSpeed} km/h</span>
                    <span className="metric-label">Wind Speed</span>
                  </div>
                </div>
              </div>

              <div className="sensor-footer">
                <div className="battery-status">
                  {getBatteryIcon(sensor.battery)}
                  <span>{sensor.battery}%</span>
                </div>
                <div className="last-update">
                  <FaWifi className={sensor.status === 'online' ? 'connection-online' : 'connection-offline'} />
                  <span>{sensor.lastUpdate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Sensor Details */}
      {selectedSensor && (
        <div className="sensor-details">
          <div className="details-header">
            <h2>{selectedSensor.name} - Detailed View</h2>
            <button 
              className="close-details"
              onClick={() => setSelectedSensor(null)}
            >
              ×
            </button>
          </div>
          
          <div className="details-content">
            <div className="detail-chart">
              <h3>24-Hour Temperature Trend</h3>
              <div className="chart-placeholder">
                <p>Chart visualization would go here</p>
                <p>Showing temperature data for {selectedSensor.location}</p>
              </div>
            </div>
            
            <div className="detail-info">
              <h3>Sensor Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Sensor ID:</label>
                  <span>SN-{selectedSensor.id.toString().padStart(6, '0')}</span>
                </div>
                <div className="info-item">
                  <label>Location:</label>
                  <span>{selectedSensor.location}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusColor(selectedSensor.status)}`}>
                    {selectedSensor.status}
                  </span>
                </div>
                <div className="info-item">
                  <label>Last Maintenance:</label>
                  <span>2 weeks ago</span>
                </div>
                <div className="info-item">
                  <label>Firmware Version:</label>
                  <span>v2.4.1</span>
                </div>
                <div className="info-item">
                  <label>Installation Date:</label>
                  <span>March 15, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IoTMonitoring;