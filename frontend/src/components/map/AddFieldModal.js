import React, { useState } from 'react';
import './Modal.css';

function AddFieldModal({ isOpen, onClose, onSave, calculatedArea, polygon }) {
  const [formData, setFormData] = useState({
    name: '',
    crop_type: '',
    planting_date: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cropTypes = [
    { value: 'tomato', label: 'Tomato' },
    { value: 'olives', label: 'Olives' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'potato', label: 'Potato' },
    { value: 'citrus', label: 'Citrus Fruits' },
    { value: 'dates', label: 'Dates' },
    { value: 'grapes', label: 'Grapes' },
    { value: 'vegetables', label: 'Mixed Vegetables' },
    { value: 'other', label: 'Other' }
  ];

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
      newErrors.name = 'Field name is required';
    }
    
    if (!formData.crop_type) {
      newErrors.crop_type = 'Please select a crop type';
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
        polygon: polygon,
        area_size: calculatedArea
      });
      
      // Reset form
      setFormData({
        name: '',
        crop_type: '',
        planting_date: '',
        notes: ''
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save field' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      crop_type: '',
      planting_date: '',
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
          <h2>Add New Field</h2>
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
                Field Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Field A, North Field"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="crop_type">
                Crop Type <span className="required">*</span>
              </label>
              <select
                id="crop_type"
                name="crop_type"
                value={formData.crop_type}
                onChange={handleChange}
                className={errors.crop_type ? 'error' : ''}
              >
                <option value="">Select a crop</option>
                {cropTypes.map(crop => (
                  <option key={crop.value} value={crop.value}>
                    {crop.label}
                  </option>
                ))}
              </select>
              {errors.crop_type && <span className="error-text">{errors.crop_type}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="planting_date">Planting Date</label>
              <input
                type="date"
                id="planting_date"
                name="planting_date"
                value={formData.planting_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="calculated_area">Calculated Area</label>
              <input
                type="text"
                id="calculated_area"
                value={`${calculatedArea.toFixed(2)} hectares`}
                readOnly
                className="readonly-input"
              />
              <p className="helper-text">Area automatically calculated from drawn polygon</p>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional information about this field..."
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
              {isSubmitting ? 'Saving...' : 'Save Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFieldModal;
