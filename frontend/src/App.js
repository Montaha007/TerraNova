import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Main from './components/dashboard/main';
import Layout from './components/layout/Layout';
import MapView from './components/map/MapView';
import PlaceholderPage from './components/PlaceholderPage';
import DiseaseDetection from './components/disease/DiseaseDetection';
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
          
            <Route path="/iot-monitoring" element={
              <PlaceholderPage 
                title="IoT Monitoring" 
                description="Real-time monitoring of soil moisture, temperature, and environmental conditions"
              />
            } />
            <Route path="/ai-advisor" element={
              <PlaceholderPage 
                title="AI Farming Advisor" 
                description="Get personalized farming advice and crop recommendations from our AI"
              />
            } />
            <Route path="/inventory" element={
              <PlaceholderPage 
                title="Inventory Management" 
                description="Track seeds, fertilizers, equipment, and harvest inventory"
              />
            } />
            <Route path="/marketplace" element={
              <PlaceholderPage 
                title="Marketplace" 
                description="Buy and sell agricultural products, equipment, and services"
              />
            } />
            <Route path="/settings" element={
              <PlaceholderPage 
                title="Settings" 
                description="Manage your account, farm details, and application preferences"
              />
            } />
          </Route>
          
          {/* Legacy route redirect */}
          <Route path="/main" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;