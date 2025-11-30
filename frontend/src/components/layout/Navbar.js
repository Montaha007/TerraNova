import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaMapMarkedAlt, 
  FaBug, 
  FaMicrochip, 
  FaBrain, 
  FaBoxes, 
  FaShoppingCart, 
  FaCog, 
  FaSignOutAlt,
  FaSeedling,
  FaBars,
  FaTimes,
  FaChevronDown
} from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const menuItems = {
    smartTools: [
      {
        icon: FaBug,
        title: 'Disease Detection',
        description: 'AI-powered plant disease detection',
        route: '/disease-detection'
      },
      {
        icon: FaMicrochip,
        title: 'IoT Monitoring',
        description: 'Real-time sensor data monitoring',
        route: '/iot-monitoring',
        badge: '3'
      },
      {
        icon: FaBrain,
        title: 'AI Advisor',
        description: 'Get smart farming recommendations',
        route: '/ai-advisor'
      }
    ],
    management: [
      {
        icon: FaBoxes,
        title: 'Inventory',
        description: 'Manage your farm inventory',
        route: '/inventory',
        badge: '24'
      },
      {
        icon: FaShoppingCart,
        title: 'Marketplace',
        description: 'Buy and sell products',
        route: '/marketplace'
      },
      {
        icon: FaCog,
        title: 'Settings',
        description: 'Configure your preferences',
        route: '/settings'
      }
    ]
  };

  const handleDropdownToggle = (dropdown) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  const handleMouseEnter = (dropdown) => {
    if (window.innerWidth >= 1024) {
      setActiveDropdown(dropdown);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      setActiveDropdown(null);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
            <img src="/logo/logowhite.png" alt="TerraNova Logo" className="logo-icon" />
            <span className="logo-text">TerraNova</span>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-menu desktop-menu">
            {/* Dashboard */}
            <div 
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <FaHome className="nav-icon" />
              <span>Dashboard</span>
            </div>

            {/* Farm Map */}
            <div 
              className={`nav-item ${location.pathname === '/map' ? 'active' : ''}`}
              onClick={() => navigate('/map')}
            >
              <FaMapMarkedAlt className="nav-icon" />
              <span>Farm Map</span>
            </div>

            {/* Smart Tools Dropdown */}
            <div 
              className="nav-dropdown"
              onMouseEnter={() => handleMouseEnter('smartTools')}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className={`nav-item dropdown-trigger ${activeDropdown === 'smartTools' ? 'active' : ''}`}
                onClick={() => handleDropdownToggle('smartTools')}
              >
                <span>Smart Tools</span>
                <FaChevronDown className={`dropdown-icon ${activeDropdown === 'smartTools' ? 'rotate' : ''}`} />
              </div>
              
              {activeDropdown === 'smartTools' && (
                <div className="dropdown-menu">
                  <div className="dropdown-grid">
                    {menuItems.smartTools.map((item, index) => (
                      <div
                        key={index}
                        className={`dropdown-item ${location.pathname === item.route ? 'active' : ''}`}
                        onClick={() => navigate(item.route)}
                      >
                        <div className="item-icon-wrapper">
                          <item.icon className="item-icon" />
                          {item.badge && <span className="item-badge">{item.badge}</span>}
                        </div>
                        <div className="item-content">
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Management Dropdown */}
            <div 
              className="nav-dropdown"
              onMouseEnter={() => handleMouseEnter('management')}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className={`nav-item dropdown-trigger ${activeDropdown === 'management' ? 'active' : ''}`}
                onClick={() => handleDropdownToggle('management')}
              >
                <span>Management</span>
                <FaChevronDown className={`dropdown-icon ${activeDropdown === 'management' ? 'rotate' : ''}`} />
              </div>
              
              {activeDropdown === 'management' && (
                <div className="dropdown-menu">
                  <div className="dropdown-grid">
                    {menuItems.management.map((item, index) => (
                      <div
                        key={index}
                        className={`dropdown-item ${location.pathname === item.route ? 'active' : ''}`}
                        onClick={() => navigate(item.route)}
                      >
                        <div className="item-icon-wrapper">
                          <item.icon className="item-icon" />
                          {item.badge && <span className="item-badge">{item.badge}</span>}
                        </div>
                        <div className="item-content">
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Section */}
          <div className="navbar-user">
            <div className="user-info">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user?.username || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-item" onClick={() => navigate('/dashboard')}>
              <FaHome /> Dashboard
            </div>
            <div className="mobile-nav-item" onClick={() => navigate('/map')}>
              <FaMapMarkedAlt /> Farm Map
            </div>
            
            <div className="mobile-section-title">Smart Tools</div>
            {menuItems.smartTools.map((item, index) => (
              <div key={index} className="mobile-nav-item" onClick={() => navigate(item.route)}>
                <item.icon /> {item.title}
                {item.badge && <span className="mobile-badge">{item.badge}</span>}
              </div>
            ))}
            
            <div className="mobile-section-title">Management</div>
            {menuItems.management.map((item, index) => (
              <div key={index} className="mobile-nav-item" onClick={() => navigate(item.route)}>
                <item.icon /> {item.title}
                {item.badge && <span className="mobile-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={cancelLogout}>Cancel</button>
              <button className="btn-logout" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
