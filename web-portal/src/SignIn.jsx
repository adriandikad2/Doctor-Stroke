import React, { useState } from 'react'

export default function SignIn({ onClose, onSuccess }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email || !password) return alert('Email and password required')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      setLoading(false)
      
      if (res.ok) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        alert('Signed in successfully!')
        onSuccess && onSuccess(data.user, data.token)
      } else {
        alert('Login failed: ' + (data.message || 'Invalid credentials'))
      }
    } catch(e) {
      setLoading(false)
      alert('Login error: ' + e.message)
    }
  }

  return (
    // GANTI INLINE STYLES DENGAN CLASSNAME
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 'min(420px, 94%)' }}>
        <h3>Sign in</h3>
        <p>Sign in to access clinician features</p>
        <input placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type='password' placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={submit} className="btn-submit">{loading ? '...' : 'Sign in'}</button>
        </div>
      </div>
    </div>
  )
}