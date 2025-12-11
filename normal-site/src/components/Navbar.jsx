import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoNew from '../assets/logo-new.png';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="nav" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '16px 32px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div className="nav-brand" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <img src={logoNew} alt="Doctor Stroke" style={{
          width: '32px',
          height: '32px',
          objectFit: 'contain',
          borderRadius: '6px'
        }} />
        <span className="brand-name" style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#8385CC'
        }}>Doctor Stroke</span>
      </div>

      <div className="nav-menu" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Link
          to="/"
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: isActive('/') ? '#8385CC' : '#64748b',
            fontWeight: isActive('/') ? '600' : '400',
            backgroundColor: isActive('/') ? 'rgba(131, 133, 204, 0.1)' : 'transparent',
            transition: 'all 0.3s ease'
          }}
        >
          🏠 Home
        </Link>
        
        {isAuthenticated && (
          <>
            <Link
              to="/patients"
              className={`nav-link ${isActive('/patients') ? 'active' : ''}`}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive('/patients') ? '#8385CC' : '#64748b',
                fontWeight: isActive('/patients') ? '600' : '400',
                backgroundColor: isActive('/patients') ? 'rgba(131, 133, 204, 0.1)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              👥 My Patients
            </Link>
            
            <Link
              to="/diet"
              className={`nav-link ${isActive('/diet') ? 'active' : ''}`}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive('/diet') ? '#8385CC' : '#64748b',
                fontWeight: isActive('/diet') ? '600' : '400',
                backgroundColor: isActive('/diet') ? 'rgba(131, 133, 204, 0.1)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              🥗 Diet Plan
            </Link>
            
            <Link
              to="/medications"
              className={`nav-link ${isActive('/medications') ? 'active' : ''}`}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive('/medications') ? '#8385CC' : '#64748b',
                fontWeight: isActive('/medications') ? '600' : '400',
                backgroundColor: isActive('/medications') ? 'rgba(131, 133, 204, 0.1)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              💊 Medications
            </Link>
            
            <Link
              to="/appointments"
              className={`nav-link ${isActive('/appointments') ? 'active' : ''}`}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive('/appointments') ? '#8385CC' : '#64748b',
                fontWeight: isActive('/appointments') ? '600' : '400',
                backgroundColor: isActive('/appointments') ? 'rgba(131, 133, 204, 0.1)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              📅 Appointments
            </Link>
            
            <Link
              to="/exercises"
              className={`nav-link ${isActive('/exercises') ? 'active' : ''}`}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive('/exercises') ? '#8385CC' : '#64748b',
                fontWeight: isActive('/exercises') ? '600' : '400',
                backgroundColor: isActive('/exercises') ? 'rgba(131, 133, 204, 0.1)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              🏃‍♂️ Exercise
            </Link>
            
            <Link
              to="/progress"
              className={`nav-link ${isActive('/progress') ? 'active' : ''}`}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive('/progress') ? '#8385CC' : '#64748b',
                fontWeight: isActive('/progress') ? '600' : '400',
                backgroundColor: isActive('/progress') ? 'rgba(131, 133, 204, 0.1)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              📊 Progress
            </Link>
            
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#64748b',
                fontWeight: '400',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🚪 Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
