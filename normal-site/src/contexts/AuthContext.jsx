import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr && userStr !== 'undefined') {
        const user = JSON.parse(userStr);
        setAuthToken(token);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Clear invalid auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthToken(token);
    setCurrentUser(user);
  };
  
  const loginWithCredentials = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        // non-json response
        return { success: false, message: 'Invalid server response' };
      }

      // Ensure server returned success and a token
      if (response.ok && data && data.success && data.data && data.data.token) {
        const token = data.data.token;
        const user = data.data.user || data.user || null;
        login(token, user);
        return { success: true, data: data.data };
      }

      // Fallback checks for other response shapes
      if (response.ok && data && data.token) {
        login(data.token, data.user || null);
        return { success: true, data };
      }

      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthToken(null);
    setCurrentUser(null);
  };

  const register = async (userData) => {
    try {
      // Split name into first and last name for the backend
      const nameParts = userData.name.split(' ');
      const first_name = nameParts[0] || userData.name;
      const last_name = nameParts.slice(1).join(' ') || ' ';
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          first_name, 
          last_name, 
          email: userData.email, 
          password: userData.password, 
          role: 'family' 
        })
      });

      // Check response status first
      if (!response.ok) {
        try {
          const data = await response.json();
          return { success: false, message: data.message || `Registration failed (${response.status})` };
        } catch (e) {
          return { success: false, message: `Registration failed (${response.status})` };
        }
      }

      // Parse successful response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('JSON parse error:', e);
        return { success: false, message: 'Server returned invalid response format' };
      }

      if (data.success) {
        // Registration successful - user needs to login with their credentials
        return { success: true, message: 'Registration successful. Please sign in.' };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message || 'Registration error occurred' };
    }
  };

  const isAuthenticated = !!authToken;

  const value = {
    authToken,
    currentUser,
    loading,
    login,
    logout,
    register,
    loginWithCredentials,
    checkAuth: checkAuth,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};