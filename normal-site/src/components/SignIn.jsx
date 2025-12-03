import React, { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import logoNew from '../assets/logo-new.png'
import heroRight from '../assets/auth-hero.jpg'

export default function SignIn({ onClose, onSuccess }) {
  const { loginWithCredentials, register } = useAuth()
  const [mode, setMode] = useState('signin')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

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
    }

    setLoading(true)

    try {
      if (mode === 'signin') {
        const response = await loginWithCredentials(email, password)

        if (response && response.success) {
          const token = response?.data?.token || response?.token
          const user = response?.data?.user || response?.user

          if (!token) {
            setError('Token not received from server')
            setLoading(false)
            return
          }

          onSuccess && onSuccess(user, token)
        } else {
          setError(response?.message || 'Login failed')
        }
      } else {
        const payload = {
          name: `${firstName} ${lastName}`,
          email,
          password
        }

        const response = await register(payload)

        if (response?.success) {
          setInfo('Registration successful. Please sign in with your credentials.')
          setMode('signin')
          setFirstName('')
          setLastName('')
          setEmail('')
          setPassword('')
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
              <span className="auth-brand__subtitle">Patient & Caregiver Portal</span>
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
                : 'Create an account to access your patient recovery tools'}
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
