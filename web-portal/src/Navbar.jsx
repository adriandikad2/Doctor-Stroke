import React from 'react';
import { useTheme } from './ThemeContext';

export default function Navbar({ isLoggedIn, user, onNavigate, onSignIn, onSignOut, onLinkPatient }) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="app-header">
      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: var(--color-card);
          border-bottom: 1px solid var(--color-border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .brand:hover {
          opacity: 0.8;
        }

        .brand-mark {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, var(--primary), var(--blue));
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(131, 133, 204, 0.3);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .app-header h1 {
          margin: 0;
          font-size: 20px;
          color: var(--primary);
          font-weight: 700;
        }

        nav {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          margin: 0 32px;
        }

        .btn-ghost {
          color: var(--primary);
          border: 1px solid transparent;
          background: transparent;
          padding: 8px 14px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-ghost:hover {
          background: var(--color-bg);
          border: 1px solid var(--primary);
          transform: translateY(-2px);
        }

        .btn-primary {
          background: var(--blue);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(104, 161, 209, 0.2);
        }

        .btn-primary:hover {
          box-shadow: 0 6px 16px rgba(104, 161, 209, 0.3);
          transform: translateY(-2px);
        }

        .theme-toggle {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          transform: rotate(20deg);
        }

        .mobile-menu-btn {
          display: none;
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--primary);
          font-size: 20px;
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 12px 16px;
          }

          nav {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--color-card);
            flex-direction: column;
            gap: 0;
            margin: 0;
            border-bottom: 1px solid var(--color-border);
            padding: 12px;
            border-radius: 0;
            animation: slideDown 0.3s ease-out;
            z-index: 1000;
          }

          nav.mobile-open {
            display: flex;
          }

          nav .btn-ghost {
            width: 100%;
            text-align: left;
            padding: 10px 12px;
            border: none;
            border-radius: 6px;
          }

          nav .btn-primary {
            width: 100%;
            margin-top: 8px;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .app-header h1 {
            font-size: 18px;
          }
        }
      `}</style>

      <div className="brand" onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}>
        <div className="brand-mark" />
        <h1>Doctor Stroke</h1>
      </div>

      <nav className={mobileMenuOpen ? 'mobile-open' : ''}>
        <button 
          className="btn-ghost" 
          onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
        >
          🏠 Home
        </button>
        {isLoggedIn && (
          <>
            <button 
              className="btn-ghost" 
              onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            >
              📊 Dashboard
            </button>
            <button 
              className="btn-ghost" 
              onClick={() => { onLinkPatient && onLinkPatient(); setMobileMenuOpen(false); }}
              title="Link a patient using unique code"
            >
              🔗 Link Patient
            </button>
            <button 
              className="btn-ghost" 
              onClick={() => { onNavigate('progress'); setMobileMenuOpen(false); }}
            >
              📈 Progress
            </button>
            <button 
              className="btn-ghost" 
              onClick={() => { onNavigate('scheduler'); setMobileMenuOpen(false); }}
            >
              📅 Scheduler
            </button>
            <button 
              className="btn-ghost" 
              onClick={() => { onNavigate('diet'); setMobileMenuOpen(false); }}
            >
              🥗 Diet
            </button>
          </>
        )}

        <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark/light mode">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {!isLoggedIn ? (
          <button className="btn-primary" onClick={() => { onSignIn(); setMobileMenuOpen(false); }}>
            Sign in
          </button>
        ) : (
          <button className="btn-primary" onClick={() => { onSignOut(); setMobileMenuOpen(false); }}>
            Sign out
          </button>
        )}
      </nav>

      <button 
        className="mobile-menu-btn" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>
    </header>
  );
}
