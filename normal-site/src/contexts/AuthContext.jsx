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
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Handle the nested response structure
      if (data.data && data.data.token) {
        login(data.data.token, data.data.user || data.user || data.data);
        return { success: true, data: data.data };
      } else if (data.token) {
        // Fallback for direct token structure
        login(data.token, data.user);
        return { success: true, data };
      } else {
        return { success: false, message: 'Login failed: Invalid response structure' };
      }
    } else {
      return { success: false, message: data.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthToken(null);
    setCurrentUser(null);
  };

  const register = async (userData) => {
    // Split name into first and last name for the backend
    const nameParts = userData.name.split(' ');
    const first_name = nameParts[0] || userData.name; // Use the whole name if no space found
    const last_name = nameParts.slice(1).join(' ') || ' '; // Use remaining parts or a space as placeholder
    
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

    const data = await response.json();
    
    if (response.ok) {
      // Handle the nested response structure
      if (data.data && data.data.token) {
        login(data.data.token, data.data.user || data.user || data.data);
        return { success: true, data: data.data };
      } else if (data.token) {
        // Fallback for direct token structure
        login(data.token, data.user);
        return { success: true, data };
      } else {
        return { success: false, message: 'Registration failed: Invalid response structure' };
      }
    } else {
      return { success: false, message: data.message || 'Registration failed' };
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