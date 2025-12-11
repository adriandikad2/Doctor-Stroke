import React, { useEffect, useState } from 'react'
import Scheduler from './Scheduler'
import SignIn from './SignIn'
import DietManagement from './DietManagement'
import Medications from './Medications'
import MedicationAdherence from './MedicationAdherence'
import Dashboard from './Dashboard'
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
    setShowSignIn(true)
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
                <h2>
                  {isLoggedIn 
                    ? `Hello dr. ${user?.first_name || user?.firstName || ''} ${user?.last_name || user?.lastName || ''}`.trim() 
                    : 'Clinician Portal — Actionable patient insights'}
                </h2>
                <p>
                  {isLoggedIn 
                    ? 'Welcome to Doctor Portal. Access structured reports, therapy schedules, and medication adherence data to support timely clinical decisions.' 
                    : 'Access structured reports, therapy schedules, and medication adherence data to support timely clinical decisions.'}
                </p>
                <div className="hero-ctas">
                  <button className="btn-primary" onClick={handleRequestAccess}>
                    {isLoggedIn ? 'Go to Dashboard' : 'Request Access'}
                  </button>
                </div>
              </div>
            </section>

            <section className="modules">
              <h3>Key Modules</h3>
              <div className="module-grid">
                <div className="module-card" onClick={() => handleNavigate('dashboard')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">📊</div><h4>Patient Dashboard</h4><p>Monitor your patients' health status and recovery.</p>
                </div>
                <div className="module-card" onClick={() => handleNavigate('scheduler')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">📅</div><h4>Scheduler</h4><p>Manage appointments and therapy sessions.</p>
                </div>
                
                <div className="module-card" onClick={() => handleNavigate('diet')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">🥗</div><h4>Nutrition Management</h4><p>Manage patient nutrition plans and logs.</p>
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
        
        {page === 'medication' && isLoggedIn && (
          <Medications user={user} />
        )}

        {page === 'adherence' && isLoggedIn && (
          <MedicationAdherence user={user} />
        )}
        
        {page === 'diet' && isLoggedIn && (
          <DietManagement user={user} />
        )}
      </main>

      <footer className="app-footer">© {new Date().getFullYear()} Doctor Stroke — Clinician Portal</footer>
      
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
        <p>Enter the unique patient code to connect with a patient for care management.</p>

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
            placeholder='e.g., PASIEN-ABCDEF' 
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
