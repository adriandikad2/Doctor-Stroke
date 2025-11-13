import React, { useEffect, useState } from 'react'
import Signup from './Signup'
import Scheduler from './Scheduler'
import SignIn from './SignIn'
import DietManagement from './DietManagement'
import Dashboard from './Dashboard'
import Progress from './Progress'
import Navbar from './Navbar'

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
  const [page, setPage] = useState('home') // 'home' | 'scheduler' | 'diet' | 'dashboard' | 'progress'
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  // State untuk melacak halaman yang dituju sebelum login
  const [pendingPage, setPendingPage] = useState(null);

  useEffect(() => {
    // Cek token saat memuat
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
    
    fetch('/api/landing')
      .then((r) => r.json())
      .then(setInfo)
      .catch((err) => console.error('Failed to load landing info', err))
  }, [])

  const handleRequestAccess = () => {
    // Show signup modal for new users
    setShowSignup(true)
  }

  // Wrapper untuk navigasi yang memerlukan login
  const handleNavigate = (targetPage) => {
    if (targetPage !== 'home' && !isLoggedIn) {
      // Simpan halaman yang dituju
      setPendingPage(targetPage); 
      setShowSignIn(true);
      return;
    }
    setPendingPage(null); // Hapus halaman tertunda
    setPage(targetPage);
  }

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setPage('home');
  }
  
  const handleSignInSuccess = () => {
    setIsLoggedIn(true); 
    setShowSignIn(false);
    // Arahkan ke halaman yang tadi ingin dibuka, atau default ke scheduler
    setPage(pendingPage || 'scheduler');
    setPendingPage(null); // Hapus halaman tertunda
  }

  const handleCloseSignIn = () => {
    setShowSignIn(false);
    setPendingPage(null); // Hapus juga jika modal ditutup
  }

  return (
    <div className="app-root" style={{ minHeight: '100vh', backgroundColor: COLORS.bgLight, color: COLORS.black, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
      
      {/* 2. Gunakan komponen Navbar baru */}
      <Navbar 
        isLoggedIn={isLoggedIn}
        onNavigate={handleNavigate} // Ini adalah prop penting
        onSignIn={() => setShowSignIn(true)}
        onSignOut={handleSignOut}
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
                  <h4>{info ? info.title : 'Loading...'}</h4>
                  <p>{info ? info.description : '...'}</p>
                  <ul>
                    {info && info.modules && info.modules.map((m) => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            <section className="modules">
              <h3>Key Modules</h3>
              <div className="module-grid">
                <div className="module-card" onClick={() => handleNavigate('dashboard')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">📊</div><h4>Dashboard</h4><p>Your health overview today.</p>
                </div>
                <div className="module-card" onClick={() => handleNavigate('scheduler')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">📅</div><h4>Scheduling</h4><p>Manage appointments and therapy sessions.</p>
                </div>
                <div className="module-card"><div className="module-emoji">💊</div><h4>Medication</h4><p>Reminders and adherence logs.</p></div>
                
                {/* 3. Tambahkan onClick di sini untuk navigasi */}
                <div className="module-card" onClick={() => handleNavigate('diet')} style={{cursor: 'pointer'}}>
                  <div className="module-emoji">🥗</div><h4>Diet</h4><p>Manage nutrition plans and log meals.</p>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'dashboard' && isLoggedIn && (
          <Dashboard />
        )}

        {page === 'scheduler' && (
          <Scheduler />
        )}
        
        {page === 'diet' && (
          <DietManagement />
        )}

        {page === 'progress' && isLoggedIn && (
          <Progress />
        )}
      </main>

      <footer className="app-footer">© {new Date().getFullYear()} Doctor Stroke — Group 7</footer>
      
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
      {showSignIn && <SignIn onClose={handleCloseSignIn} onSuccess={handleSignInSuccess} />}
    </div>
  )
}