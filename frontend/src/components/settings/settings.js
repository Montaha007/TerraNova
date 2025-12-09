import React, { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaUser, 
  FaBell, 
  FaLock, 
  FaGlobe, 
  FaDatabase,
  FaPalette,
  FaMobile,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaSave,
  FaTrash,
  FaPlus,
  FaEdit,
  FaCamera
} from 'react-icons/fa';
import './settings.css';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    // Profile Settings
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    farmName: '',
    farmLocation: '',
    farmSize: '',
    bio: '',
    avatar: null
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weatherAlerts: true,
    marketUpdates: false,
    systemUpdates: true,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    locationSharing: true,
    dataSharing: false,
    analyticsTracking: true,
    showOnlineStatus: false
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    theme: 'light',
    autoSave: true,
    compactView: false
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '24'
  });

  const [savedMessage, setSavedMessage] = useState('');
  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FaUser },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'privacy', name: 'Privacy', icon: FaLock },
    { id: 'preferences', name: 'Preferences', icon: FaCog },
    { id: 'security', name: 'Security', icon: FaLock },
    { id: 'data', name: 'Data Management', icon: FaDatabase }
  ];

  useEffect(() => {
    // Load user data from API
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/api/user/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            username: data.username || '',
            email: data.email || '',
            phone: data.phone_number || '',
            farmName: data.farm_name || '',
            farmLocation: data.city || '',
            farmSize: data.total_area ? `${data.total_area} hectares` : '0 hectares'
          }));
        } else {
          // Fallback to localStorage if API fails
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          setFormData(prev => ({
            ...prev,
            username: userData.username || '',
            email: userData.email || '',
            phone: userData.phone_number || '',
            farmName: userData.farm_name || '',
            farmLocation: userData.city || '',
            farmSize: '0 hectares'
          }));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Fallback to localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setFormData(prev => ({
          ...prev,
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone_number || '',
          farmName: userData.farm_name || '',
          farmLocation: userData.city || '',
          farmSize: '0 hectares'
        }));
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (section, field, value) => {
    switch (section) {
      case 'profile':
        setFormData(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotifications(prev => ({ ...prev, [field]: value }));
        break;
      case 'privacy':
        setPrivacy(prev => ({ ...prev, [field]: value }));
        break;
      case 'preferences':
        setPreferences(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecurity(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (activeTab === 'profile') {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.farmName.trim()) newErrors.farmName = 'Farm name is required';
    }

    if (activeTab === 'security') {
      if (security.newPassword && security.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (security.newPassword !== security.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setSavedMessage('Please log in to save changes');
        return;
      }

      const response = await fetch('http://localhost:8000/api/user/update/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          phone_number: formData.phone,
          farm_name: formData.farmName,
          city: formData.farmLocation
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedMessage('Profile updated successfully!');
        
        // Update localStorage with new data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.username = data.username;
        userData.email = data.email;
        userData.phone_number = data.phone_number;
        userData.farm_name = data.farm_name;
        userData.city = data.city;
        localStorage.setItem('user', JSON.stringify(userData));
        
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setSavedMessage(`Error: ${errorData.error || 'Failed to update profile'}`);
        setTimeout(() => setSavedMessage(''), 5000);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSavedMessage('Failed to save changes. Please try again.');
      setTimeout(() => setSavedMessage(''), 5000);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportData = () => {
    alert('Export functionality would download all user data');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion would be processed');
    }
  };

  const renderProfileTab = () => (
    <div className="settings-section">
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-container">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Profile" className="avatar" />
            ) : (
              <div className="avatar-placeholder">
                <FaUser />
              </div>
            )}
            <label className="avatar-upload">
              <FaCamera />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                hidden
              />
            </label>
          </div>
          <div className="avatar-info">
            <h3>Profile Picture</h3>
            <p>Upload a profile picture to personalize your account</p>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('profile', 'username', e.target.value)}
            className={errors.username ? 'error' : ''}
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Farm Name</label>
          <input
            type="text"
            value={formData.farmName}
            onChange={(e) => handleInputChange('profile', 'farmName', e.target.value)}
            className={errors.farmName ? 'error' : ''}
          />
          {errors.farmName && <span className="error-message">{errors.farmName}</span>}
        </div>

        <div className="form-group">
          <label>Farm Location</label>
          <input
            type="text"
            value={formData.farmLocation}
            onChange={(e) => handleInputChange('profile', 'farmLocation', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Farm Size</label>
          <input
            type="text"
            value={formData.farmSize}
            onChange={(e) => handleInputChange('profile', 'farmSize', e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label>Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
            rows="4"
            placeholder="Tell us about your farm..."
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      <p className="section-description">Choose how you want to receive notifications</p>

      <div className="notification-groups">
        <div className="notification-group">
          <h4>System Notifications</h4>
          <div className="notification-items">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Email Notifications</strong>
                <p>Receive important updates via email</p>
              </div>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={notifications.pushNotifications}
                onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Push Notifications</strong>
                <p>Get instant notifications in your browser</p>
              </div>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={notifications.systemUpdates}
                onChange={(e) => handleInputChange('notifications', 'systemUpdates', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>System Updates</strong>
                <p>Be notified about platform updates and maintenance</p>
              </div>
            </label>
          </div>
        </div>

        <div className="notification-group">
          <h4>Farm & Weather Alerts</h4>
          <div className="notification-items">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={notifications.weatherAlerts}
                onChange={(e) => handleInputChange('notifications', 'weatherAlerts', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Weather Alerts</strong>
                <p>Get notified about severe weather and optimal conditions</p>
              </div>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={notifications.marketUpdates}
                onChange={(e) => handleInputChange('notifications', 'marketUpdates', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Market Updates</strong>
                <p>Receive price alerts and market trends</p>
              </div>
            </label>
          </div>
        </div>

        <div className="notification-group">
          <h4>Marketing</h4>
          <div className="notification-items">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={notifications.marketingEmails}
                onChange={(e) => handleInputChange('notifications', 'marketingEmails', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Marketing Emails</strong>
                <p>Receive tips, promotions, and product recommendations</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="settings-section">
      <h3>Privacy Settings</h3>
      <p className="section-description">Control how your information is shared and used</p>

      <div className="privacy-groups">
        <div className="privacy-group">
          <h4>Profile Visibility</h4>
          <div className="privacy-items">
            <label className="radio-item">
              <input
                type="radio"
                name="profileVisibility"
                value="public"
                checked={privacy.profileVisibility === 'public'}
                onChange={(e) => handleInputChange('privacy', 'profileVisibility', e.target.value)}
              />
              <span className="radio-button"></span>
              <div className="radio-content">
                <strong>Public</strong>
                <p>Anyone can see your profile and farm information</p>
              </div>
            </label>

            <label className="radio-item">
              <input
                type="radio"
                name="profileVisibility"
                value="private"
                checked={privacy.profileVisibility === 'private'}
                onChange={(e) => handleInputChange('privacy', 'profileVisibility', e.target.value)}
              />
              <span className="radio-button"></span>
              <div className="radio-content">
                <strong>Private</strong>
                <p>Only approved connections can see your profile</p>
              </div>
            </label>
          </div>
        </div>

        <div className="privacy-group">
          <h4>Data Sharing</h4>
          <div className="privacy-items">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={privacy.locationSharing}
                onChange={(e) => handleInputChange('privacy', 'locationSharing', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Location Sharing</strong>
                <p>Share your farm location for better recommendations</p>
              </div>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={privacy.dataSharing}
                onChange={(e) => handleInputChange('privacy', 'dataSharing', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Share Anonymous Data</strong>
                <p>Help improve the platform by sharing anonymous usage data</p>
              </div>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={privacy.analyticsTracking}
                onChange={(e) => handleInputChange('privacy', 'analyticsTracking', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Analytics Tracking</strong>
                <p>Allow us to track usage patterns to improve the service</p>
              </div>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={privacy.showOnlineStatus}
                onChange={(e) => handleInputChange('privacy', 'showOnlineStatus', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Show Online Status</strong>
                <p>Let others see when you're active on the platform</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="settings-section">
      <h3>Application Preferences</h3>
      <p className="section-description">Customize your application experience</p>

      <div className="form-grid">
        <div className="form-group">
          <label>Language</label>
          <select
            value={preferences.language}
            onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <div className="form-group">
          <label>Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
          >
            <option value="UTC">UTC</option>
            <option value="GMT+1">GMT+1 (Tunis)</option>
            <option value="GMT+2">GMT+2</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date Format</label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => handleInputChange('preferences', 'dateFormat', e.target.value)}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="form-group">
          <label>Currency</label>
          <select
            value={preferences.currency}
            onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="TND">TND (د.ت)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Theme</label>
          <select
            value={preferences.theme}
            onChange={(e) => handleInputChange('preferences', 'theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="form-group">
          <label>Session Timeout</label>
          <select
            value={security.sessionTimeout}
            onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
          >
            <option value="1">1 hour</option>
            <option value="24">24 hours</option>
            <option value="168">1 week</option>
            <option value="720">1 month</option>
          </select>
        </div>

        <div className="form-group full-width">
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => handleInputChange('preferences', 'autoSave', e.target.checked)}
              />
              <span className="checkbox"></span>
              <span>Auto-save forms and drafts</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={preferences.compactView}
                onChange={(e) => handleInputChange('preferences', 'compactView', e.target.checked)}
              />
              <span className="checkbox"></span>
              <span>Use compact view for lists and tables</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-section">
      <h3>Security Settings</h3>
      <p className="section-description">Manage your account security and authentication</p>

      <div className="security-groups">
        <div className="security-group">
          <h4>Change Password</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={security.currentPassword}
                onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={security.newPassword}
                onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                className={errors.newPassword ? 'error' : ''}
              />
              {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={security.confirmPassword}
                onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
        </div>

        <div className="security-group">
          <h4>Two-Factor Authentication</h4>
          <div className="security-items">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={security.twoFactorAuth}
                onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Enable 2FA</strong>
                <p>Add an extra layer of security to your account</p>
              </div>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={security.loginAlerts}
                onChange={(e) => handleInputChange('security', 'loginAlerts', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-content">
                <strong>Login Alerts</strong>
                <p>Get notified when someone logs into your account</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="settings-section">
      <h3>Data Management</h3>
      <p className="section-description">Manage your data and account information</p>

      <div className="data-actions">
        <div className="action-group">
          <h4>Export Your Data</h4>
          <p>Download a copy of all your data including farm information, transactions, and settings.</p>
          <button className="btn-secondary" onClick={handleExportData}>
            <FaDatabase /> Export All Data
          </button>
        </div>

        <div className="action-group">
          <h4>Delete Account</h4>
          <p className="warning">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="btn-danger" onClick={handleDeleteAccount}>
            <FaTrash /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'privacy': return renderPrivacyTab();
      case 'preferences': return renderPreferencesTab();
      case 'security': return renderSecurityTab();
      case 'data': return renderDataTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="sidebar-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="settings-content">
          {savedMessage && (
            <div className="saved-message">
              <FaCheckCircle />
              {savedMessage}
            </div>
          )}

          {renderTabContent()}

          <div className="settings-actions">
            <button className="btn-primary" onClick={handleSave}>
              <FaSave /> Save Changes
            </button>
            <button className="btn-secondary" onClick={() => window.history.back()}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;