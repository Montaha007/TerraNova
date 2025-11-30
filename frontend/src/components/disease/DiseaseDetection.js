import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCamera, 
  FaUpload, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaShoppingCart, 
  FaHistory, 
  FaInfoCircle,
  FaLeaf,
  FaTimes,
  FaPrint,
  FaShareAlt
} from 'react-icons/fa';
import './DiseaseDetection.css';

function DiseaseDetection() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // State management
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [detectionResult, setDetectionResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [fields, setFields] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchRecentScans();
    fetchFields();
  }, []);

  // Fetch user's fields for selection
  const fetchFields = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://localhost:8000/api/farm-data/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch fields');
      
      const data = await response.json();
      setFields(data.fields || []);
    } catch (err) {
      console.error('Failed to fetch fields:', err);
    }
  };

  // Fetch recent disease detection scans
  const fetchRecentScans = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://localhost:8000/api/disease/history/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      setRecentScans(data.detections || []);
    } catch (err) {
      console.error('Failed to fetch recent scans:', err);
    }
  };

  // Handle image file selection
  const handleFileSelect = (event, isCamera = false) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError('');
    setImageFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload and analyze image
  const uploadImage = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setUploading(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Optional: attach to specific field
    if (selectedField) {
      formData.append('field_id', selectedField.id);
    }

    try {
      const token = localStorage.getItem('access_token');
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:8000/api/disease/detect/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Detection failed');
      }

      const data = await response.json();
      setDetectionResult(data);
      setScanned(true);
      
      // Refresh recent scans
      fetchRecentScans();
    } catch (err) {
      setError(err.message || 'Failed to analyze image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset to initial state
  const handleNewScan = () => {
    setScanned(false);
    setImagePreview(null);
    setImageFile(null);
    setDetectionResult(null);
    setError('');
    setSelectedField(null);
  };

  // Get severity badge configuration
  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { label: 'Low', color: '#28a745', bgColor: 'rgba(40, 167, 69, 0.1)' },
      medium: { label: 'Medium', color: '#ffc107', bgColor: 'rgba(255, 193, 7, 0.1)' },
      high: { label: 'High', color: '#dc3545', bgColor: 'rgba(220, 53, 69, 0.1)' },
      critical: { label: 'Critical', color: '#9e2a2b', bgColor: 'rgba(158, 42, 43, 0.1)' },
      healthy: { label: 'Healthy', color: '#28a745', bgColor: 'rgba(40, 167, 69, 0.1)' }
    };
    return severityConfig[severity] || severityConfig.medium;
  };

  // Format date helper
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // View details of a previous scan
  const handleViewScanDetail = async (scanId) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:8000/api/disease/${scanId}/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch scan details');
      
      const data = await response.json();
      setDetectionResult(data);
      setImagePreview(data.detection.image_url);
      setScanned(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to load scan details');
      console.error(err);
    }
  };

  return (
    <div className="disease-detection-page">
 

      <div className="detection-container">
        {!scanned ? (
          // BEFORE SCAN VIEW
          <div className="detection-grid">
            {/* Camera/Upload Card */}
            <div className="upload-card">
              <h2>Scan Plant</h2>
              
              {/* Image Preview Area */}
              <div className="image-preview-area">
                {imagePreview ? (
                  <div className="preview-container">
                    <img src={imagePreview} alt="Preview" className="preview-image" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="remove-image-btn"
                      title="Remove image"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <FaCamera className="placeholder-icon" />
                    <p>No image selected</p>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">Uploading... {uploadProgress}%</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="error-alert">
                  <FaExclamationTriangle />
                  <div>
                    <p>{error}</p>
                    <button onClick={() => setError('')} className="dismiss-btn">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Field Selection */}
              <div className="field-selection">
                <label htmlFor="field-select">Select Field (Optional)</label>
                <select 
                  id="field-select"
                  value={selectedField?.id || ''}
                  onChange={(e) => {
                    const field = fields.find(f => f.id === parseInt(e.target.value));
                    setSelectedField(field);
                  }}
                  disabled={loading}
                >
                  <option value="">Not specified</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>
                      {field.name} - {field.crop_type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileSelect(e, true)}
                  style={{ display: 'none' }}
                />
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn btn-camera"
                  disabled={loading}
                >
                  <FaCamera />
                  Capture Image
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-upload"
                  disabled={loading}
                >
                  <FaUpload />
                  Upload Image
                </button>
              </div>

              {imageFile && !loading && (
                <button 
                  onClick={uploadImage}
                  className="btn btn-analyze"
                >
                  <FaLeaf />
                  Analyze Image
                </button>
              )}

              {/* Loading State */}
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Analyzing image with AI...</p>
                  <p className="loading-subtext">This may take a few seconds</p>
                </div>
              )}

              {/* Tips Section */}
              <div className="tips-section">
                <h3><FaInfoCircle /> Tips for Best Results</h3>
                <ul>
                  <li>Ensure good lighting on the plant</li>
                  <li>Capture affected areas clearly</li>
                  <li>Avoid blurry images</li>
                  <li>Include leaves showing symptoms</li>
                </ul>
              </div>
            </div>

            {/* Recent Scans Card */}
            <div className="recent-scans-card">
              <div className="card-header">
                <h2><FaHistory /> Recent Scans</h2>
              </div>
              
              <div className="scans-list">
                {recentScans.length === 0 ? (
                  <div className="empty-state">
                    <FaHistory className="empty-icon" />
                    <p>No recent scans</p>
                    <p className="empty-subtext">Your scan history will appear here</p>
                  </div>
                ) : (
                  recentScans.slice(0, 10).map(scan => {
                    const badge = getSeverityBadge(scan.severity);
                    return (
                      <div 
                        key={scan.id} 
                        className="scan-item"
                        onClick={() => handleViewScanDetail(scan.id)}
                      >
                        <div className="scan-image-thumb">
                          {scan.image_url ? (
                            <img src={`http://localhost:8000${scan.image_url}`} alt="Scan" />
                          ) : (
                            <FaLeaf />
                          )}
                        </div>
                        <div className="scan-info">
                          <h4>{scan.disease_name}</h4>
                          <p className="scan-field">{scan.field?.name || 'No field'}</p>
                          <p className="scan-date">{formatDate(scan.detection_date)}</p>
                        </div>
                        <div className="scan-severity">
                          <span 
                            className="severity-badge"
                            style={{ 
                              backgroundColor: badge.bgColor,
                              color: badge.color
                            }}
                          >
                            {badge.label}
                          </span>
                          <p className="confidence">{(scan.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          // AFTER SCAN VIEW - RESULTS
          <div className="results-view">
            {/* Back Button */}
            <button onClick={handleNewScan} className="btn btn-back">
              ← New Scan
            </button>

            {/* Diagnosis Result Card */}
            <div className="diagnosis-card">
              <h2>Diagnosis Result</h2>
              
              <div className="diagnosis-grid">
                {/* Scanned Image */}
                <div className="scanned-image">
                  <img 
                    src={imagePreview || `http://localhost:8000${detectionResult?.detection?.image_url}`} 
                    alt="Scanned plant" 
                  />
                </div>

                {/* Detection Info */}
                <div className="detection-info">
                  {detectionResult?.detection?.detected ? (
                    <>
                      <div className="disease-header">
                        <h3>{detectionResult.detection.summary.disease_types.join(', ').replace(/_/g, ' ').toUpperCase()}</h3>
                        <span 
                          className="severity-badge-large"
                          style={{ 
                            ...getSeverityBadge(detectionResult.saved_detections[0]?.severity || 'medium'),
                            backgroundColor: getSeverityBadge(detectionResult.saved_detections[0]?.severity || 'medium').bgColor,
                            color: getSeverityBadge(detectionResult.saved_detections[0]?.severity || 'medium').color
                          }}
                        >
                          {getSeverityBadge(detectionResult.saved_detections[0]?.severity || 'medium').label}
                        </span>
                      </div>

                      {/* Confidence Level */}
                      <div className="confidence-section">
                        <div className="confidence-header">
                          <span>Confidence Level</span>
                          <span className="confidence-value">
                            {(detectionResult.detection.summary.max_confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill"
                            style={{ width: `${detectionResult.detection.summary.max_confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Impact Warning */}
                      <div className="impact-warning">
                        <FaExclamationTriangle />
                        <div>
                          <h4>Detection Summary</h4>
                          <p>Total Detections: {detectionResult.detection.summary.total_detections}</p>
                          <p>Disease Types Found: {detectionResult.detection.summary.disease_types.length}</p>
                        </div>
                      </div>

                      {/* Detected Diseases List */}
                      <div className="diseases-detected">
                        <h4>Detected Issues</h4>
                        {detectionResult.detection.diseases.map((disease, index) => (
                          <div key={index} className="disease-item">
                            <div className="disease-item-header">
                              <span className="disease-name">
                                {disease.class.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <span className="disease-confidence">
                                {(disease.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="disease-bbox-info">
                              Location detected in image
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="action-buttons-result">
                        <button className="btn btn-secondary" onClick={() => window.print()}>
                          <FaPrint /> Print Results
                        </button>
                        <button className="btn btn-secondary">
                          <FaShareAlt /> Share
                        </button>
                      </div>
                    </>
                  ) : (
                    // Healthy Plant
                    <div className="healthy-result">
                      <FaCheckCircle className="healthy-icon" />
                      <h3>Plant Looks Healthy!</h3>
                      <p>No diseases detected in this image.</p>
                      <p className="healthy-tip">
                        Continue monitoring your plants regularly for best results.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Treatment Recommendations (if disease detected) */}
            {detectionResult?.detection?.detected && detectionResult?.treatment_recommendation && (
              <div className="treatment-card">
                <h2>Treatment Recommendations</h2>
                
                <div className="treatment-content">
                  {/* Description */}
                  <div className="treatment-section">
                    <h3>About This Disease</h3>
                    <p>{detectionResult.treatment_recommendation.description}</p>
                  </div>

                  {/* Symptoms */}
                  {detectionResult.treatment_recommendation.symptoms && (
                    <div className="treatment-section">
                      <h3>Common Symptoms</h3>
                      <p>{detectionResult.treatment_recommendation.symptoms}</p>
                    </div>
                  )}

                  {/* Treatment Steps */}
                  {detectionResult.treatment_recommendation.treatment_steps && (
                    <div className="treatment-section">
                      <h3>Treatment Steps</h3>
                      <ol className="treatment-steps">
                        {detectionResult.treatment_recommendation.treatment_steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Organic Treatment */}
                  {detectionResult.treatment_recommendation.organic_treatment && (
                    <div className="treatment-section">
                      <h3>Organic Treatment</h3>
                      <p>{detectionResult.treatment_recommendation.organic_treatment}</p>
                    </div>
                  )}

                  {/* Chemical Treatment */}
                  {detectionResult.treatment_recommendation.chemical_treatment && (
                    <div className="treatment-section">
                      <h3>Chemical Treatment</h3>
                      <p>{detectionResult.treatment_recommendation.chemical_treatment}</p>
                    </div>
                  )}

                  {/* Prevention Tips */}
                  {detectionResult.treatment_recommendation.prevention_tips && (
                    <div className="treatment-section">
                      <h3>Prevention Tips</h3>
                      <ul className="prevention-list">
                        {detectionResult.treatment_recommendation.prevention_tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recovery Time */}
                  <div className="recovery-info">
                    <FaInfoCircle />
                    <span>
                      Estimated Recovery: {detectionResult.treatment_recommendation.estimated_recovery_days} days
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TODO Note for Future Products Integration */}
            {detectionResult?.detection?.detected && (
              <div className="coming-soon-card">
                <FaShoppingCart className="coming-soon-icon" />
                <h3>Product Recommendations Coming Soon</h3>
                <p>We're working on integrating marketplace products for treatment recommendations.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DiseaseDetection;
