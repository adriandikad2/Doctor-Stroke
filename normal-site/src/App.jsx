import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Patients from './components/Patients';
import Diet from './components/Diet';
import Medications from './components/Medications';
import Exercises from './components/Exercises';
import Progress from './components/Progress';
import Appointments from './components/Appointments';
import EmergencyButton from './components/EmergencyButton';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Main App Component
const AppContent = () => {
  const { authToken, checkAuth, loading } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f6fbff',
        color: '#8385CC'
      }}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading...</div>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f6fbff',
      color: '#000000',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      <EmergencyButton />
      
      <main className="main-content" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute>
                <Patients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/diet" 
            element={
              <ProtectedRoute>
                <Diet />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medications" 
            element={
              <ProtectedRoute>
                <Medications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exercises" 
            element={
              <ProtectedRoute>
                <Exercises />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      
      <footer className="app-footer" style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: 'var(--color-card, #ffffff)',
        borderTop: '1px solid var(--color-border, #e2e8f0)',
        marginTop: 'auto',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        © {new Date().getFullYear()} Doctor Stroke — Patient & Caregiver Portal
      </footer>
    </div>
  );
};

// Main App Export
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
