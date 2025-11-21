import React, { useEffect, useState } from 'react'
import Signup from './Signup'
import Scheduler from './Scheduler'
import SignIn from './SignIn'
import DietManagement from './DietManagement'
import Dashboard from './Dashboard'
import Progress from './Progress'
import Navbar from './Navbar'
import { patientAPI, getSavedUser, clearAuth } from './utils/api'

const COLORS = {
  primary: '#8385CC',
  blue: '#68A1D1',
  teal: '#79AEB3',
  green: '#A4CEA9',
  lavender: '#B199C7',
  soft: '#E0BEE6',
  bgLight: '#f6fbff',
  white: '#FFFFFF',
  black: '#000000'
}

export default function App() {
  const [info, setInfo] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('home')
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showLinkPatient, setShowLinkPatient] = useState(false)
  const [pendingPage, setPendingPage] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const savedUser = getSavedUser()
    
    if (token && savedUser) {
      setIsLoggedIn(true)
      setUser(savedUser)
    }
  }, [])

  const handleRequestAccess = () => {
    setShowSignup(true)
  }

  const handleNavigate = (targetPage) => {
    if (targetPage !== 'home' && !isLoggedIn) {
      setPendingPage(targetPage)
      setShowSignIn(true)
      return
    }
    setPendingPage(null)
    setPage(targetPage)
  }

  const handleSignOut = () => {
    clearAuth()
    setIsLoggedIn(false)
    setUser(null)
    setPage('home')
  }
  
  const handleSignInSuccess = (userData, token) => {
    setIsLoggedIn(true)
    setUser(userData)
    setShowSignIn(false)
    setPage(pendingPage || 'dashboard')
    setPendingPage(null)
  }

  const handleCloseSignIn = () => {
    setShowSignIn(false)
    setPendingPage(null)
  }

  return (
    <div className="app-root" style={{ minHeight: '100vh', backgroundColor: COLORS.bgLight, color: COLORS.black, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
      
      <Navbar 
        isLoggedIn={isLoggedIn}
        user={user}
        onNavigate={handleNavigate}
        onSignIn={() => setShowSignIn(true)}
        onSignOut={handleSignOut}
        onLinkPatient={() => setShowLinkPatient(true)}
      />

      <main className="container">
        {page === 'home' && (
          <>
            <section className="hero-card">
              <div className="hero-text">
                <h2>Clinician Portal — Actionable patient insights</h2>
                <p>Access structured reports, therapy schedules, and medication adherence data to support timely clinical decisions.</p>
                <div className="hero-ctas">
                  <button className="btn-primary" onClick={handleRequestAccess}>Request Access</button>
                  <a className="btn-ghost" href="#learn">Learn more</a>
                </div>
              </div>
              <div className="hero-side">
                <div className="panel">
                  <h4>Welcome to Doctor Stroke Portal</h4>
                  <p>Manage your patients' recovery journey with comprehensive clinical tools.</p>
                  <ul>
                    <li>📊 Dashboard & Patient Overview</li>
                    <li>📅 Schedule & Appointments</li>
                    <li>💊 Medication & Adherence Tracking</li>
                    <li>🥗 Nutrition & Diet Management</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="modules">
              <h3>Key Modules</h3>
              <div className="module-grid">
                <div className="module-card" onClick={() => handleNavigate('dashboard')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">📊</div><h4>Dashboard</h4><p>Your patients overview today.</p>
                </div>
                <div className="module-card" onClick={() => handleNavigate('scheduler')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">📅</div><h4>Scheduling</h4><p>Manage appointments and therapy sessions.</p>
                </div>
                <div className="module-card" onClick={() => handleNavigate('progress')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">📈</div><h4>Progress</h4><p>Track patient recovery and adherence.</p>
                </div>
                
                <div className="module-card" onClick={() => handleNavigate('diet')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">🥗</div><h4>Diet</h4><p>Manage nutrition plans and logs.</p>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'dashboard' && isLoggedIn && (
          <Dashboard user={user} />
        )}

        {page === 'scheduler' && isLoggedIn && (
          <Scheduler user={user} />
        )}
        
        {page === 'diet' && isLoggedIn && (
          <DietManagement user={user} />
        )}

        {page === 'progress' && isLoggedIn && (
          <Progress user={user} />
        )}
      </main>

      <footer className="app-footer">© {new Date().getFullYear()} Doctor Stroke — Group 7</footer>
      
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
      {showSignIn && <SignIn onClose={handleCloseSignIn} onSuccess={handleSignInSuccess} />}
      {showLinkPatient && <LinkPatientModal onClose={() => setShowLinkPatient(false)} onSuccess={() => setShowLinkPatient(false)} />}
    </div>
  )
}

/**
 * LinkPatientModal Component
 * Modal untuk menghubungkan pasien menggunakan unique code
 */
function LinkPatientModal({ onClose, onSuccess }) {
  const [uniqueCode, setUniqueCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!uniqueCode.trim()) {
      setError('Please enter patient code')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await patientAPI.linkPatient(uniqueCode.trim())

      if (response.success) {
        setSuccess(`Patient linked successfully!`)
        setUniqueCode('')
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        setError(response.message || 'Failed to link patient')
      }
    } catch (e) {
      setError(e.message || 'An error occurred while linking patient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 'min(400px, 94%)' }}>
        <h3>Link Patient</h3>
        <p>Enter the unique patient code to connect with a patient.</p>

        {error && <div style={{ 
          color: '#d32f2f', 
          fontSize: '14px', 
          marginBottom: '12px',
          padding: '8px 12px',
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          borderRadius: '4px'
        }}>{error}</div>}

        {success && <div style={{ 
          color: '#388e3c', 
          fontSize: '14px', 
          marginBottom: '12px',
          padding: '8px 12px',
          backgroundColor: 'rgba(56, 142, 60, 0.1)',
          borderRadius: '4px'
        }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <input 
            type="text"
            placeholder='e.g., PASIEN-AX17B9' 
            value={uniqueCode} 
            onChange={(e) => {
              setUniqueCode(e.target.value)
              setError('')
            }}
            disabled={loading}
            style={{ 
              marginBottom: '16px',
              textTransform: 'uppercase'
            }}
          />

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Linking...' : 'Link Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}