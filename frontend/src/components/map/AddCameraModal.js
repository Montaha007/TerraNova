import React, { useState } from 'react';
import './Modal.css';

function AddCameraModal({ isOpen, onClose, onSave, latitude, longitude }) {
  const [formData, setFormData] = useState({
    name: '',
    stream_url: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Camera name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        latitude: latitude,
        longitude: longitude
      });
      
      // Reset form
      setFormData({
        name: '',
        stream_url: '',
        notes: ''
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save camera' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      stream_url: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Camera</h2>
          <button className="modal-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div className="error-banner">{errors.submit}</div>
            )}

            <div className="form-group">
              <label htmlFor="name">
                Camera Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Camera 1, North Gate Camera"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="stream_url">Stream URL</label>
              <input
                type="text"
                id="stream_url"
                name="stream_url"
                value={formData.stream_url}
                onChange={handleChange}
                placeholder="rtsp://... or http://..."
              />
              <p className="helper-text">Optional: URL to live camera stream</p>
            </div>

            <div className="form-group">
              <label htmlFor="coordinates">Location</label>
              <input
                type="text"
                id="coordinates"
                value={`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
                readOnly
                className="readonly-input"
              />
              <p className="helper-text">Coordinates from map click</p>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional information about this camera..."
                rows="3"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-save"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Camera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCameraModal;
