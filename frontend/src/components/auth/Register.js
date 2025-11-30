import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    farm_name: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tunisianCities = [
    'Tunis',
    'Nabeul',
    'Sousse',
    'Sfax',
    'Bizerte',
    'Gabes',
    'Kairouan',
    'Monastir',
    'Beja',
    'Ariana'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (formData.email.trim()) {
      // Basic email validation (only if provided)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.city) {
      setError('City is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email || '',
          password: formData.password,
          password2: formData.password2,
          farm_name: formData.farm_name || 'My Farm',
          city: formData.city
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens in localStorage
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to main dashboard
        navigate('/main');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please check if the Django server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Register to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <i className="error-icon">⚠</i>
              {error}
            </div>
          )}

          {/* Account Information Section */}
          <div className="form-section">
            <h3 className="form-section-title">Account Information</h3>
            
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                disabled={loading}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 6 characters)"
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password2">Confirm Password *</label>
              <input
                type="password"
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Farm Information Section */}
          <div className="form-section">
            <h3 className="form-section-title">Farm Information</h3>
            
            <div className="form-group">
              <label htmlFor="farm_name">Farm Name (optional)</label>
              <input
                type="text"
                id="farm_name"
                name="farm_name"
                value={formData.farm_name}
                onChange={handleChange}
                placeholder="My Farm"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
                required
                className="form-select"
              >
                <option value="">Select your city</option>
                {tunisianCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <p className="form-helper-text">
                We'll use this to show weather and farming conditions
              </p>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
