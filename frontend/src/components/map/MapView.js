import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, FeatureGroup, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddFieldModal from './AddFieldModal';
import AddCameraModal from './AddCameraModal';
import MapToolbar from './MapToolbar';
import './MapView.css';

// Fix Leaflet default marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map click handler component
function MapClickHandler({ mode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (mode === 'camera') {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

// Confirmation Dialog Component
function ConfirmDialog({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirm Delete</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn btn-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function MapView() {
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('view');
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', id: null, message: '' });
  const [tempPolygon, setTempPolygon] = useState(null);
  const [tempMarker, setTempMarker] = useState(null);
  const [calculatedArea, setCalculatedArea] = useState(0);
  const [drawControlRef, setDrawControlRef] = useState(null);
  const mapRef = useRef(null);

  const fetchFarmData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/farm-data/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFarmData(data);
      } else {
        setError('Failed to load farm data');
      }
    } catch (err) {
      console.error('Error fetching farm data:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmData();
  }, []);

  // Calculate area in hectares from polygon coordinates using Haversine formula
  const calculateArea = (latlngs) => {
    if (!latlngs || latlngs.length < 3) return 0;
    
    // Convert to array of [lat, lng] if needed
    const points = latlngs.map(point => 
      Array.isArray(point) ? point : [point.lat, point.lng]
    );
    
    // Calculate geodesic area using spherical excess
    const earthRadius = 6371000; // meters
    let area = 0;
    
    const toRadians = (degrees) => degrees * Math.PI / 180;
    
    if (points.length > 2) {
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        
        area += toRadians(p2[1] - p1[1]) * 
                (2 + Math.sin(toRadians(p1[0])) + Math.sin(toRadians(p2[0])));
      }
      
      area = Math.abs(area * earthRadius * earthRadius / 2);
    }
    
    // Convert to hectares (1 hectare = 10,000 square meters)
    const areaInHectares = area / 10000;
    
    return areaInHectares;
  };

  // Handle polygon created
  const handlePolygonCreated = (e) => {
    if (mode !== 'field') return;
    
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0];
    const coords = latlngs.map(ll => [ll.lat, ll.lng]);
    
    setTempPolygon(coords);
    
    // Calculate area
    const area = calculateArea(latlngs);
    setCalculatedArea(area);
    
    setIsFieldModalOpen(true);
    
    // Remove the layer temporarily
    layer.remove();
  };

  // Handle map click for camera placement
  const handleMapClick = (latlng) => {
    setTempMarker({ lat: latlng.lat, lng: latlng.lng });
    setIsCameraModalOpen(true);
  };

  // Save field
  const handleSaveField = async (fieldData) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/fields/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Field added successfully!');
        setIsFieldModalOpen(false);
        setTempPolygon(null);
        setMode('view');
        // Refresh data
        await fetchFarmData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save field');
      }
    } catch (err) {
      console.error('Error saving field:', err);
      toast.error(err.message || 'Failed to save field');
      throw err;
    }
  };

  // Save camera
  const handleSaveCamera = async (cameraData) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/cameras/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cameraData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Camera added successfully!');
        setIsCameraModalOpen(false);
        setTempMarker(null);
        setMode('view');
        // Refresh data
        await fetchFarmData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save camera');
      }
    } catch (err) {
      console.error('Error saving camera:', err);
      toast.error(err.message || 'Failed to save camera');
      throw err;
    }
  };

  // Delete field
  const handleDeleteField = async (fieldId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/fields/${fieldId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Field deleted successfully!');
        setConfirmDialog({ isOpen: false, type: '', id: null, message: '' });
        await fetchFarmData();
      } else {
        throw new Error('Failed to delete field');
      }
    } catch (err) {
      console.error('Error deleting field:', err);
      toast.error('Failed to delete field');
    }
  };

  // Delete camera
  const handleDeleteCamera = async (cameraId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/cameras/${cameraId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Camera deleted successfully!');
        setConfirmDialog({ isOpen: false, type: '', id: null, message: '' });
        await fetchFarmData();
      } else {
        throw new Error('Failed to delete camera');
      }
    } catch (err) {
      console.error('Error deleting camera:', err);
      toast.error('Failed to delete camera');
    }
  };

  // Handle mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode !== 'field') {
      setTempPolygon(null);
    }
    if (newMode !== 'camera') {
      setTempMarker(null);
    }
  };

  // Close modals
  const handleCloseFieldModal = () => {
    setIsFieldModalOpen(false);
    setTempPolygon(null);
    setMode('view');
  };

  const handleCloseCameraModal = () => {
    setIsCameraModalOpen(false);
    setTempMarker(null);
    setMode('view');
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!farmData || !farmData.farm || !farmData.farm.latitude) {
    return (
      <div className="map-error">
        <p>No farm location data available. Please complete your farm setup.</p>
      </div>
    );
  }

  const { farm, fields, cameras } = farmData;
  const center = [farm.latitude, farm.longitude];
  const totalFields = fields?.length || 0;
  const activeCameras = cameras?.filter(c => c.is_active).length || 0;
  const totalArea = fields?.reduce((sum, field) => sum + (parseFloat(field.area_size) || 0), 0) || 0;

  return (
    <div className="map-view-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="map-header">
        <h2>Interactive Farm Map</h2>
        <p>View, add, and manage your farm fields and monitoring equipment</p>
      </div>

      <div className="map-wrapper">
        <MapToolbar mode={mode} onModeChange={handleModeChange} />
        
        <MapContainer
          center={center}
          zoom={13}
          className="leaflet-map"
          scrollWheelZoom={true}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Drawing controls */}
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handlePolygonCreated}
              draw={{
                rectangle: true,
                circle: true,
                circlemarker: false,
                marker: true,
                polyline: true,
                polygon: {
                  allowIntersection: false,
                  showArea: true,
                  drawError: {
                    color: '#e1e100',
                    message: '<strong>Error:</strong> shape edges cannot cross!'
                  },
                  shapeOptions: {
                    color: '#ff7800',
                    fillOpacity: 0.3
                  },
                  metric: true,
                  feet: false
                }
              }}
              edit={{
                edit: true,
                remove: true
              }}
            />
          </FeatureGroup>

          {/* Map click handler for camera mode */}
          <MapClickHandler mode={mode} onMapClick={handleMapClick} />

          {/* Farm Headquarters Marker */}
          <Marker position={center} icon={greenIcon}>
            <Popup>
              <div className="map-popup">
                <h3>{farm.name}</h3>
                <p><strong>City:</strong> {farm.city}</p>
                <p><strong>Coordinates:</strong></p>
                <p>Lat: {farm.latitude.toFixed(6)}</p>
                <p>Lng: {farm.longitude.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>

          {/* Field Markers */}
          {fields && fields.map((field) => (
            field.latitude && field.longitude && (
              <React.Fragment key={field.id}>
                <Marker position={[field.latitude, field.longitude]} icon={orangeIcon}>
                  <Popup>
                    <div className="map-popup">
                      <h3>{field.name}</h3>
                      <p><strong>Crop:</strong> {field.crop_type}</p>
                      <p><strong>Status:</strong> {field.status}</p>
                      {field.area_size && (
                        <p><strong>Area:</strong> {field.area_size} hectares</p>
                      )}
                      {field.planting_date && (
                        <p><strong>Planted:</strong> {new Date(field.planting_date).toLocaleDateString()}</p>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={() => setConfirmDialog({
                          isOpen: true,
                          type: 'field',
                          id: field.id,
                          message: `Are you sure you want to delete "${field.name}"?`
                        })}
                      >
                        ❌ Delete Field
                      </button>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Render polygon if available */}
                {field.polygon && (
                  <Polygon
                    positions={field.polygon}
                    pathOptions={{
                      color: '#ff7800',
                      fillColor: '#ffaa00',
                      fillOpacity: 0.3,
                      weight: 2
                    }}
                  />
                )}
              </React.Fragment>
            )
          ))}

          {/* Camera Markers */}
          {cameras && cameras.map((camera) => (
            camera.latitude && camera.longitude && (
              <Marker
                key={camera.id}
                position={[camera.latitude, camera.longitude]}
                icon={blueIcon}
              >
                <Popup>
                  <div className="map-popup">
                    <h3>{camera.name}</h3>
                    <p><strong>Status:</strong> {camera.is_active ? 'Active' : 'Inactive'}</p>
                    {camera.stream_url && (
                      <button className="view-stream-btn" onClick={() => window.open(camera.stream_url, '_blank')}>
                        View Stream
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => setConfirmDialog({
                        isOpen: true,
                        type: 'camera',
                        id: camera.id,
                        message: `Are you sure you want to delete "${camera.name}"?`
                      })}
                    >
                      ❌ Delete Camera
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Temporary marker for camera placement */}
          {tempMarker && (
            <Marker
              position={[tempMarker.lat, tempMarker.lng]}
              icon={blueIcon}
            />
          )}
        </MapContainer>

        {/* Map Legend */}
        <div className="map-legend">
          <h4>Legend</h4>
          <div className="legend-item">
            <div className="legend-icon" style={{ backgroundColor: '#28a745' }}></div>
            <span>Farm Headquarters</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ backgroundColor: '#e09f3e' }}></div>
            <span>Fields</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ backgroundColor: '#007bff' }}></div>
            <span>Cameras</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="map-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e09f3e' }}>
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{totalFields}</h3>
            <p>Total Fields</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#007bff' }}>
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{activeCameras}</h3>
            <p>Active Cameras</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{totalArea.toFixed(2)}</h3>
            <p>Total Area (ha)</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddFieldModal
        isOpen={isFieldModalOpen}
        onClose={handleCloseFieldModal}
        onSave={handleSaveField}
        calculatedArea={calculatedArea}
        polygon={tempPolygon}
      />

      <AddCameraModal
        isOpen={isCameraModalOpen}
        onClose={handleCloseCameraModal}
        onSave={handleSaveCamera}
        latitude={tempMarker?.lat || 0}
        longitude={tempMarker?.lng || 0}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '', id: null, message: '' })}
        onConfirm={() => {
          if (confirmDialog.type === 'field') {
            handleDeleteField(confirmDialog.id);
          } else if (confirmDialog.type === 'camera') {
            handleDeleteCamera(confirmDialog.id);
          }
        }}
        message={confirmDialog.message}
      />
    </div>
  );
}

export default MapView;
