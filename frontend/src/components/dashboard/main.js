import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, Droplets, ThermometerSun, AlertTriangle, 
  TrendingUp, Package, MessageSquare, CheckCircle2, Camera, 
  ShoppingCart, Leaf, Activity
} from 'lucide-react';
import FieldCard from './FieldCard';
import FieldCardSkeleton from './FieldCardSkeleton';
import EmptyFieldState from './EmptyFieldState';
import './main.css';

function Main() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [farmData, setFarmData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');

      if (!token) {
        // No token found, redirect to login
        navigate('/');
        return;
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Optionally verify token with backend
      try {
        const response = await fetch('http://localhost:8000/api/user/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          
          // Fetch farm data
          try {
            const farmResponse = await fetch('http://localhost:8000/api/farm-data/', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (farmResponse.ok) {
              const farmInfo = await farmResponse.json();
              setFarmData(farmInfo);
            }
          } catch (farmErr) {
            console.error('Farm data fetch error:', farmErr);
          }
          
          // Fetch weather data
          fetchWeatherData(token);
        } else {
          // Token is invalid, clear storage and redirect
          localStorage.clear();
          navigate('/');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        // On network error, still allow if we have user data
        if (!userData) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchWeatherData = async (token) => {
    setWeatherLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/weather/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Weather data received:', data);
        setWeatherData(data);
      } else {
        console.error('Weather fetch failed:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setWeatherLoading(false);
    }
  };



  const handleNavigate = (page) => {
    setCurrentPage(page);
    // You can implement navigation logic here for different sections
  };

  if (loading) {
    return (
      <div className="map-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">


      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="welcome-section">
            <div>
              <h2 className="welcome-title">Welcome back, {user?.username}!</h2>
              <p className="welcome-subtitle">Here's what's happening with your farm today</p>
            </div>
            <div className="last-updated">
              <div className="update-label">Last updated</div>
              <div className="update-time">2 minutes ago</div>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="weather-card">
            <div className="weather-decoration-1"></div>
            <div className="weather-decoration-2"></div>
            <div className="weather-content">
              <div className="weather-left">
                <div className="weather-icon-box">
                  {weatherLoading ? (
                    <div className="spinner-small"></div>
                  ) : weatherData?.weather?.icon ? (
                    <img 
                      src={`https://openweathermap.org/img/wn/${weatherData.weather.icon}@2x.png`}
                      alt={weatherData.weather.description}
                      style={{ width: '60px', height: '60px' }}
                    />
                  ) : (
                    <Cloud size={40} />
                  )}
                </div>
                <div>
                  <h3 className="weather-location">
                    {weatherLoading ? (
                      'Loading location...'
                    ) : (
                      <>
                        {weatherData?.location?.city || farmData?.farm?.city || 'Your Farm'}, Tunisia
                      </>
                    )}
                  </h3>
                  <p className="weather-description">
                    {weatherLoading ? (
                      'Fetching weather data...'
                    ) : weatherData?.weather ? (
                      <>
                        {weatherData.weather.description} • {' '}
                        {weatherData.weather.good_for_farming 
                          ? 'Perfect for farming' 
                          : 'Check conditions'}
                      </>
                    ) : (
                      'Weather data unavailable'
                    )}
                  </p>
                </div>
              </div>
              <div className="weather-stats">
                <div className="weather-stat">
                  <div className="stat-value">
                    {weatherData?.weather?.temperature ?? '--'}°C
                  </div>
                  <div className="stat-label">Temperature</div>
                </div>
                <div className="weather-divider"></div>
                <div className="weather-stat">
                  <div className="stat-value">
                    {weatherData?.weather?.humidity ?? '--'}%
                  </div>
                  <div className="stat-label">Humidity</div>
                </div>
                <div className="weather-divider"></div>
                <div className="weather-stat">
                  <div className="stat-value">
                    {weatherData?.weather?.wind_speed ?? '--'}
                  </div>
                  <div className="stat-label">km/h Wind</div>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Health Score */}
          <div className="health-score-card">
            <div className="health-content">
              <div className="health-info">
                <h3 className="health-title">Farm Health Score</h3>
                <p className="health-description">
                  Overall health status based on AI analysis of all your farm data
                </p>
                <div className="health-badge">
                  <CheckCircle2 size={20} />
                  <span>Excellent Performance</span>
                </div>
              </div>
              <div className="health-score-circle">
                <svg className="score-svg" viewBox="0 0 176 176">
                  <circle
                    cx="88"
                    cy="88"
                    r="75"
                    stroke="white"
                    strokeOpacity="0.2"
                    strokeWidth="14"
                    fill="none"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="75"
                    stroke="white"
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 75}`}
                    strokeDashoffset={`${2 * Math.PI * 75 * (1 - 0.87)}`}
                    strokeLinecap="round"
                    className="score-progress"
                  />
                </svg>
                <div className="score-value">
                  <div className="score-number">87</div>
                  <div className="score-max">/ 100</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card stat-green">
              <div className="stat-info">
                <p className="stat-label">Total Fields</p>
                <div className="stat-number">{farmData?.fields?.length || 0}</div>
                <div className="stat-change">
                  <Leaf size={12} />
                  <span>Fields registered</span>
                </div>
              </div>
              <div className="stat-icon-box stat-icon-green">
                <Leaf size={32} />
              </div>
            </div>
              <div className="stat-card stat-orange">
              <div className="stat-info">
                <p className="stat-label">Active Alerts</p>
                <div className="stat-number">3</div>
                <div className="stat-change-neutral">
                  <span>2 critical</span>
                </div>
              </div>
              <div className="stat-icon-box stat-icon-orange">
                <AlertTriangle size={32} />
              </div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-info">
                <p className="stat-label">Active Cameras</p>
                <div className="stat-number">
                  {farmData?.cameras?.filter(c => c.is_active).length || 0}
                </div>
                <div className="stat-change">
                  <Camera size={12} />
                  <span>Monitoring</span>
                </div>
              </div>
              <div className="stat-icon-box stat-icon-green">
                <Camera size={32} />
              </div>
            </div>
            <div className="stat-card stat-orange">
              <div className="stat-info">
                <p className="stat-label">Stock Items Low</p>
                <div className="stat-number">5</div>
                <div className="stat-change-warning">
                  <span>Reorder needed</span>
                </div>
              </div>
              <div className="stat-icon-box stat-icon-orange">
                <Package size={32} />
              </div>
            </div>

            <div className="stat-card stat-green">
              <div className="stat-info">
                <p className="stat-label">Total Area</p>
                <div className="stat-number">
                  {farmData?.fields?.reduce((sum, field) => sum + (field.area_size || 0), 0).toFixed(2) || 0}
                </div>
                <div className="stat-change">
                  <TrendingUp size={12} />
                  <span>hectares</span>
                </div>
              </div>
              <div className="stat-icon-box stat-icon-green">
                <TrendingUp size={32} />
              </div>
            </div>
          </div>

          {/* My Fields Section */}
          <div className="my-fields-section">
            <div className="section-header">
              <h2>My Fields</h2>
              <button 
                className="add-field-btn"
                onClick={() => navigate('/map')}
              >
                + Add Field
              </button>
            </div>
            <div className="fields-grid">
              {loading ? (
                <>
                  <FieldCardSkeleton />
                  <FieldCardSkeleton />
                  <FieldCardSkeleton />
                </>
              ) : farmData?.fields?.length > 0 ? (
                farmData.fields.map(field => (
                  <FieldCard key={field.id} field={field} />
                ))
              ) : (
                <EmptyFieldState />
              )}
            </div>
          </div>

          {/* Alerts and Field Status */}
          <div className="alerts-fields-grid">
            {/* Recent Alerts */}
            <div className="alerts-card">
              <div className="card-header">
                <div className="card-header-left">
                  <div className="card-icon-box card-icon-orange">
                    <AlertTriangle size={20} />
                  </div>
                  <h3>Recent Alerts</h3>
                </div>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="alerts-list">
                <div className="alert-item alert-warning">
                  <div className="alert-icon-box">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="alert-title">Low Soil Moisture - Field A</span>
                      <span className="badge badge-warning">Warning</span>
                    </div>
                    <p className="alert-description">Current: 28% | Optimal: 45-60%</p>
                    <p className="alert-time">2 hours ago</p>
                  </div>
                </div>

                <div className="alert-item alert-warning">
                  <div className="alert-icon-box">
                    <Package size={20} />
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="alert-title">Fertilizer Stock Low</span>
                      <span className="badge badge-warning">Low Stock</span>
                    </div>
                    <p className="alert-description">NPK 15-15-15: Only 2 bags remaining</p>
                    <p className="alert-time">1 day ago</p>
                  </div>
                </div>

                <div className="alert-item alert-success">
                  <div className="alert-icon-box alert-success-icon">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="alert-title">Disease Treatment Completed</span>
                      <span className="badge badge-success">Resolved</span>
                    </div>
                    <p className="alert-description">Tomato early blight successfully treated</p>
                    <p className="alert-time">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>


                
          </div>


          {/* Quick Actions */}
          <div className="quick-actions-card">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => handleNavigate('disease-detection')}>
                <Camera size={32} />
                <span>Scan Plant</span>
              </button>
              <button className="action-btn" onClick={() => handleNavigate('inventory')}>
                <Package size={32} />
                <span>Check Inventory</span>
              </button>
              <button className="action-btn" onClick={() => handleNavigate('marketplace')}>
                <ShoppingCart size={32} />
                <span>Browse Market</span>
              </button>
              <button className="action-btn" onClick={() => handleNavigate('ai-advisor')}>
                <MessageSquare size={32} />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Main;