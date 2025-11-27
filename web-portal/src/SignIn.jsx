import React, { useMemo, useState, useCallback } from 'react'
import { authAPI, saveAuth } from './utils/api'
import logoNew from './assets/logo-new.png'
import heroRight from './assets/auth-hero.jpg'

/**
 * Auth experience inspired by provided reference screens.
 * Combines sign in + register in one overlay and keeps parity with backend_main fields.
 */
export default function SignIn({ onClose, onSuccess }) {
  const [mode, setMode] = useState('signin')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('doctor')
  const [medicalLicense, setMedicalLicense] = useState('')
  const [specialization, setSpecialization] = useState('NEUROLOGIST')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const specializations = useMemo(
    () => ({
      doctor: ['NEUROLOGIST', 'PHYSIATRIST'],
      therapist: ['PHYSICAL', 'OCCUPATIONAL', 'RECREATIONAL', 'SPEECH', 'PSYCHOLOGIST', 'DIETITIAN'],
    }),
    []
  )

  const resetMessages = () => {
    setError('')
    setInfo('')
  }







  const handleAuth = async (e) => {
    e.preventDefault()
    resetMessages()

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    if (mode === 'register') {
      if (!firstName || !lastName) {
        setError('First and last name are required')
        return
      }
      if (password !== confirmPassword) {
        setError('Password confirmation does not match')
        return
      }
      if (!medicalLicense) {
        setError('License number is required')
        return
      }
    }

    setLoading(true)

    try {
      if (mode === 'signin') {
        const response = await authAPI.login(email, password)

        if (response && response.success && response.data) {
          const token = response.data.token
          const user = response.data.user

          if (!token) {
            setError('Token not received from server')
            setLoading(false)
            return
          }

          saveAuth(token, user)
          onSuccess && onSuccess(user, token)
        } else {
          setError(response?.message || 'Login failed')
        }
      } else {
        const payload = {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role,
          medical_license: medicalLicense,
          specialization,
        }

        const response = await authAPI.register(payload)

        if (response?.success) {
          setInfo('Registration successful. Please sign in with your credentials.')
          setMode('signin')
          setConfirmPassword('')
        } else {
          setError(response?.message || 'Registration failed')
        }
      }
    } catch (e) {
      setError(e.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    resetMessages()
  }

  return (
    <div className="auth-overlay">
      <div className="auth-shell">
        <div className="auth-nav">
          <div className="auth-brand">
            <img src={logoNew} alt="Doctor Stroke Logo" className="auth-brand__logo" />
            <div className="auth-brand__text">
              <span className="auth-brand__title">Doctor Stroke</span>
              <span className="auth-brand__subtitle">Post-Stroke Care</span>
            </div>
          </div>
          <button className="auth-close" onClick={onClose} aria-label="Close authentication dialog">
            ✕
          </button>
        </div>

        <div className="auth-body">
          <div className="auth-form">
            <h2>{mode === 'signin' ? 'Sign in to your account' : 'Create an account'}</h2>
            <p className="auth-lead">
              {mode === 'signin'
                ? 'Enter your Email and Password'
                : 'Create an account to manage doctor appointments at Doctor Stroke'}
            </p>



            {error && <div className="auth-alert auth-alert--error">{error}</div>}
            {info && <div className="auth-alert auth-alert--info">{info}</div>}

            <form className="auth-fields" onSubmit={handleAuth}>
              {mode === 'register' && (
                <div className="auth-row">
                  <div className="field">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value)
                        resetMessages()
                      }}
                      placeholder="Enter first name"
                      disabled={loading}
                    />
                  </div>
                  <div className="field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value)
                        resetMessages()
                      }}
                      placeholder="Enter last name"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    resetMessages()
                  }}
                  placeholder="Enter email"
                  disabled={loading}
                  required
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    resetMessages()
                  }}
                  placeholder="Enter password"
                  disabled={loading}
                  required
                />
              </div>

              {mode === 'register' && (
                <>
                  <div className="field">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        resetMessages()
                      }}
                      placeholder="Confirm password"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="auth-row auth-row--compact">
                    <label className="field-label">Role</label>
                    <div className="pill-group">
                      {['doctor', 'therapist'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`pill ${role === r ? 'pill--active' : ''}`}
                          onClick={() => {
                            setRole(r)
                            setSpecialization(specializations[r][0])
                            resetMessages()
                          }}
                          disabled={loading}
                        >
                          {r === 'doctor' ? 'Doctor' : 'Therapist'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="auth-row">
                    <div className="field">
                      <label>License Number</label>
                      <input
                        type="text"
                        value={medicalLicense}
                        onChange={(e) => {
                          setMedicalLicense(e.target.value)
                          resetMessages()
                        }}
                        placeholder="Enter license number"
                        disabled={loading}
                      />
                    </div>
                    <div className="field">
                      <label>Specialization</label>
                      <select
                        value={specialization}
                        onChange={(e) => {
                          setSpecialization(e.target.value)
                          resetMessages()
                        }}
                        disabled={loading}
                      >
                        {specializations[role].map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="auth-actions">
                <button type="submit" className="primary-action" disabled={loading}>
                  {loading ? 'Processing...' : mode === 'signin' ? 'Sign in' : 'Register'}
                </button>
              </div>
            </form>

            <div className="auth-toggle">
              <span>{mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}</span>
              <button type="button" className="auth-toggle__link" onClick={() => switchMode(mode === 'signin' ? 'register' : 'signin')}>
                {mode === 'signin' ? 'Register' : 'Sign in'}
              </button>
            </div>
          </div>

          <div className="auth-visual">
            <img src={heroRight} alt="Recovery process" className="auth-visual__image" />
          </div>
        </div>
      </div>
    </div>
  )
}
