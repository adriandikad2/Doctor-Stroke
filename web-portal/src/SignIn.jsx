import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { authAPI, saveAuth } from './utils/api'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
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

  const handleGoogleLogin = useCallback(async (response) => {
    resetMessages()
    setLoading(true)

    try {
      if (!response.credential) {
        setError('Google login failed')
        setLoading(false)
        return
      }

      const result = await authAPI.googleLogin(response.credential)

      if (result?.success && result?.data) {
        const token = result.data.token
        const user = result.data.user

        if (!token) {
          setError('Token tidak diterima dari server')
          setLoading(false)
          return
        }

        saveAuth(token, user)
        onSuccess && onSuccess(user, token)
      } else {
        setError(result?.message || 'Google login gagal')
        setLoading(false)
      }
    } catch (e) {
      console.error('Google login error:', e)
      setError(e.message || 'Terjadi kesalahan saat login dengan Google')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: handleGoogleLogin,
          ux_mode: 'popup',
        })
        
        // Render button to container
        const container = document.getElementById('google_signin_button')
        if (container) {
          try {
            window.google.accounts.id.renderButton(container, {
              type: 'standard',
              size: 'large',
              text: 'signin',
              locale: 'id',
            })
          } catch (e) {
            console.log('Button already rendered or error:', e)
          }
        }
      }
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [handleGoogleLogin])

  const handleAppleLogin = useCallback(async () => {
    resetMessages()
    setLoading(true)

    try {
      if (!window.AppleID) {
        setError('Apple Sign-In tidak tersedia di browser Anda')
        setLoading(false)
        return
      }

      window.AppleID.auth.init({
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
        teamId: import.meta.env.VITE_APPLE_TEAM_ID || 'YOUR_APPLE_TEAM_ID',
        keyId: import.meta.env.VITE_APPLE_KEY_ID || 'YOUR_APPLE_KEY_ID',
        redirectURI: window.location.origin,
        usePopup: true,
      })

      const response = await window.AppleID.auth.signIn()

      if (response && response.authorization && response.authorization.id_token) {
        const result = await authAPI.appleLogin(response.authorization.id_token)

        if (result?.success && result?.data) {
          const token = result.data.token
          const user = result.data.user

          if (!token) {
            setError('Token tidak diterima dari server')
            setLoading(false)
            return
          }

          saveAuth(token, user)
          onSuccess && onSuccess(user, token)
        } else {
          setError(result?.message || 'Apple login gagal')
          setLoading(false)
        }
      } else {
        setError('Apple login dibatalkan')
        setLoading(false)
      }
    } catch (e) {
      console.error('Apple login error:', e)
      setError(e.message || 'Terjadi kesalahan saat login dengan Apple')
      setLoading(false)
    }
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    resetMessages()

    if (!email || !password) {
      setError('Email dan password wajib diisi')
      return
    }

    if (mode === 'register') {
      if (!firstName || !lastName) {
        setError('Nama depan dan belakang wajib diisi')
        return
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak sesuai')
        return
      }
      if (!medicalLicense) {
        setError('Nomor lisensi wajib diisi')
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
            setError('Token tidak diterima dari server')
            setLoading(false)
            return
          }

          saveAuth(token, user)
          onSuccess && onSuccess(user, token)
        } else {
          setError(response?.message || 'Login gagal')
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
          setInfo('Registrasi berhasil. Silakan masuk menggunakan kredensial Anda.')
          setMode('signin')
          setConfirmPassword('')
        } else {
          setError(response?.message || 'Registrasi gagal')
        }
      }
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan. Coba lagi.')
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
                : 'Buat akun untuk mengelola janji temu dokter di Doctor Stroke'}
            </p>

            <div className="auth-social">
              <div id="google_signin_button" style={{ display: 'flex', justifyContent: 'center' }} />

              <button type="button" className="social-btn" onClick={handleAppleLogin} disabled={loading}>
                <FaApple size={20} />
                <span>{mode === 'signin' ? 'Sign in or Register with Apple' : 'Register with Apple'}</span>
              </button>
            </div>

            {error && <div className="auth-alert auth-alert--error">{error}</div>}
            {info && <div className="auth-alert auth-alert--info">{info}</div>}

            <form className="auth-fields" onSubmit={handleAuth}>
              {mode === 'register' && (
                <div className="auth-row">
                  <div className="field">
                    <label>Nama Depan</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value)
                        resetMessages()
                      }}
                      placeholder="Masukkan nama depan"
                      disabled={loading}
                    />
                  </div>
                  <div className="field">
                    <label>Nama Belakang</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value)
                        resetMessages()
                      }}
                      placeholder="Masukkan nama belakang"
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
                    <label>Konfirmasi Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        resetMessages()
                      }}
                      placeholder="Masukkan ulang password"
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
                          {r === 'doctor' ? 'Dokter' : 'Terapis'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="auth-row">
                    <div className="field">
                      <label>Nomor Lisensi</label>
                      <input
                        type="text"
                        value={medicalLicense}
                        onChange={(e) => {
                          setMedicalLicense(e.target.value)
                          resetMessages()
                        }}
                        placeholder="Masukkan nomor lisensi"
                        disabled={loading}
                      />
                    </div>
                    <div className="field">
                      <label>Spesialisasi</label>
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

              {mode === 'signin' && (
                <div className="auth-extra">
                  <span className="auth-extra__caption">Resend verification email or reset password?</span>
                  <button type="button" className="auth-extra__link" onClick={() => alert('Silakan hubungi admin untuk verifikasi ulang.')}>
                    Click Here
                  </button>
                </div>
              )}

              {mode === 'signin' && <div className="captcha-placeholder">reCAPTCHA placeholder</div>}

              <div className="auth-actions">
                <button type="submit" className="primary-action" disabled={loading}>
                  {loading ? 'Processing...' : mode === 'signin' ? 'Sign in' : 'Register'}
                </button>
              </div>
            </form>

            <div className="auth-toggle">
              <span>{mode === 'signin' ? "Belum punya akun?" : 'Sudah punya akun?'}</span>
              <button type="button" className="auth-toggle__link" onClick={() => switchMode(mode === 'signin' ? 'register' : 'signin')}>
                {mode === 'signin' ? 'Register' : 'Sign in'}
              </button>
            </div>
          </div>

          <div className="auth-visual">
            <div className="auth-visual__image" style={{ backgroundImage: `url(${heroRight})` }} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
