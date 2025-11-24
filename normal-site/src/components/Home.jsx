import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { register, login, loginWithCredentials } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const result = await loginWithCredentials(loginForm.email, loginForm.password);
      
      if (result.success) {
        setMessage('Login successful!');
      } else {
        setMessage(result.message || 'Login failed');
      }
    } catch (err) {
      setMessage(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const result = await register(registerForm);
      if (result.success) {
        setMessage('Registration successful! Please sign in.');
        setActiveTab('login');
        setRegisterForm({ name: '', email: '', password: '' });
      } else {
        setMessage(result.message || 'Registration failed');
      }
    } catch (err) {
      setMessage(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 200px)', // Account for header and footer
      padding: '20px',
      backgroundColor: '#f6fbff'
    }}>
      <div className="auth-container" style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        padding: '30px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#8385CC',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>⚕️</span>
          </div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#8385CC'
          }}>Doctor Stroke — Patient Portal</h1>
          <p style={{
            margin: '0',
            color: '#64748b',
            fontSize: '14px'
          }}>Track patient recovery and manage care plans</p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          marginBottom: '20px',
          backgroundColor: '#f1f5f9',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'login' ? '#8385CC' : 'transparent',
              color: activeTab === 'login' ? '#ffffff' : '#64748b',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'register' ? '#8385CC' : 'transparent',
              color: activeTab === 'register' ? '#ffffff' : '#64748b',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            backgroundColor: message.includes('successful') || message.includes('Login') ? '#dcfce7' : '#fee2e2',
            color: message.includes('successful') || message.includes('Login') ? '#166534' : '#dc2626',
            border: `1px solid ${message.includes('successful') || message.includes('Login') ? '#86efac' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="login-email" style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#334155'
              }}>Email</label>
              <input
                id="login-email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#334155'
              }}>Password</label>
              <input
                id="login-password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                backgroundColor: '#8385CC',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#6a6cc2'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#8385CC'}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Registration Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="register-name" style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#334155'
              }}>Full Name</label>
              <input
                id="register-name"
                type="text"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="register-email" style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#334155'
              }}>Email</label>
              <input
                id="register-email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="register-password" style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#334155'
              }}>Password</label>
              <input
                id="register-password"
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                backgroundColor: '#8385CC',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#6a6cc2'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#8385CC'}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <p>For patient access, contact your healthcare provider for login credentials.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;