import React, { useState } from 'react'
import { authAPI, saveAuth } from './utils/api'

export default function SignIn({ onClose, onSuccess }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await authAPI.login(email, password)
      
      console.log('Login response:', response);
      
      if (response && response.success && response.data) {
        const token = response.data.token;
        const user = response.data.user;
        
        // Validate token exists
        if (!token) {
          console.error('Token missing in response:', response);
          setError('No token received from server');
          setLoading(false);
          return;
        }
        
        // Save auth data
        saveAuth(token, user);
        console.log('Auth saved successfully, token:', token);
        
        setLoading(false)
        onSuccess && onSuccess(user, token)
      } else {
        const errorMsg = response?.message || 'Login failed';
        setError(errorMsg);
        setLoading(false)
      }
    } catch(e) {
      console.error('Login error:', e);
      setError(e.message || 'An error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 'min(420px, 94%)' }}>
        <h3>Sign in</h3>
        <p>Sign in to access clinician features</p>
        
        {error && <div style={{ 
          color: '#d32f2f', 
          fontSize: '14px', 
          marginBottom: '12px',
          padding: '8px 12px',
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          borderRadius: '4px'
        }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input 
            type="email"
            placeholder='Email' 
            value={email} 
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            disabled={loading}
            style={{ marginBottom: '12px' }}
          />
          <input 
            type='password' 
            placeholder='Password' 
            value={password} 
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            disabled={loading}
            style={{ marginBottom: '16px' }}
          />
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}