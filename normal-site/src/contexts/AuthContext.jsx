import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi helper untuk load user dari localStorage (tanpa memaksa hit /auth/me yang 404)
  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      if (token) setAuthToken(token);
      if (userStr && userStr !== 'undefined') {
        try {
          setUser(JSON.parse(userStr));
        } catch {
          setUser(null);
        }
      }
      // Jika backend sudah menyediakan /auth/me, bisa diaktifkan lagi:
      // const response = await api.get('/auth/me');
      // if (response?.user) setUser(response.user);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData || {}));
    setAuthToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthToken(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, authToken, login, logout, loading, isAuthenticated: !!authToken, checkAuth }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
