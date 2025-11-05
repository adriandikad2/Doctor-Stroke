import React, { useEffect, useState } from 'react'
import Signup from './Signup'

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

  useEffect(() => {
    fetch('/api/landing')
      .then((r) => r.json())
      .then(setInfo)
      .catch((err) => console.error('Failed to load landing info', err))
  }, [])

  const handleSignUp = async () => {
    // keep for backwards compatibility — now we open the overlay
    setShowSignup(true)
  }

  const [showSignup, setShowSignup] = useState(false)

  return (
    <div className="app-root" style={{ minHeight: '100vh', backgroundColor: COLORS.bgLight, color: COLORS.black, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" />
          <h1>Doctor Stroke</h1>
        </div>
        <nav>
          <button className="btn-primary" onClick={handleSignUp}>Request Access</button>
        </nav>
      </header>

      <main className="container">
        <section className="hero-card">
          <div className="hero-text">
            <h2>Clinician Portal — Actionable patient insights</h2>
            <p>Access structured reports, therapy schedules, and medication adherence data to support timely clinical decisions.</p>
            <div className="hero-ctas">
              <button className="btn-primary" onClick={handleSignUp}>Request Access</button>
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
            <div className="module-card"><div className="module-emoji">📅</div><h4>Scheduling</h4><p>Manage appointments and therapy sessions.</p></div>
            <div className="module-card"><div className="module-emoji">💊</div><h4>Medication</h4><p>Reminders and adherence logs.</p></div>
            <div className="module-card"><div className="module-emoji">📈</div><h4>Reporting</h4><p>Structured progress reports for clinicians.</p></div>
          </div>
        </section>
      </main>

      <footer className="app-footer">© {new Date().getFullYear()} Doctor Stroke — Group 7</footer>
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
    </div>
  )
}
