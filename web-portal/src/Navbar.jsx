import React from 'react';
import { useTheme } from './ThemeContext'; // <-- 1. IMPORT useTheme

// Navbar menerima props untuk mengelola state dari App.jsx
export default function Navbar({ isLoggedIn, onNavigate, onSignIn, onSignOut }) {
  const { theme, toggleTheme } = useTheme(); // <-- 2. GUNAKAN THEME HOOK

  return (
    <header className="app-header">
      <div className="brand" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
        <div className="brand-mark" />
        <h1>Doctor Stroke</h1>
      </div>
      <nav>
        <button className="btn-ghost" onClick={() => onNavigate('home')}>
          Home
        </button>
        <button className="btn-ghost" onClick={() => onNavigate('scheduler')} style={{ marginLeft: 8 }}>
          Scheduler
        </button>
        <button className="btn-ghost" onClick={() => onNavigate('diet')} style={{ marginLeft: 8 }}>
          Diet
        </button>
        
        {/* 3. TAMBAHKAN TOMBOL THEME TOGGLE */}
        <button className="btn-ghost" onClick={toggleTheme} style={{ marginLeft: 8, minWidth: 50 }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        {!isLoggedIn ? (
          <button className="btn-primary" onClick={onSignIn} style={{ marginLeft: 12 }}>
            Sign in
          </button>
        ) : (
          <button className="btn-primary" onClick={onSignOut} style={{ marginLeft: 12 }}>
            Sign out
          </button>
        )}
      </nav>
    </header>
  );
}