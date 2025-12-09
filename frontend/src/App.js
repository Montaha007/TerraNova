import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Main from './components/dashboard/main';
import Layout from './components/layout/Layout';
import MapView from './components/map/MapView';
import DiseaseDetection from './components/disease/DiseaseDetection';
import IoTMonitoring from './components/iot/IoTMonitoring';
import AIAdvisor from './components/advisor/AIAdvisor';
import Inventory from './components/inventory/inventory';
import Marketplace from './components/marketplace/marketplace';
import Settings from './components/settings/settings';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes with Sidebar Layout */}
            <Route 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Main />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="/iot-monitoring" element={<IoTMonitoring />} />
              <Route path="/ai-advisor" element={<AIAdvisor />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/settings" element={<Settings />} />
              
            </Route>
            
            {/* Legacy route redirect */}
            <Route path="/main" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;