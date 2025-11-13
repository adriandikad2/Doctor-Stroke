import React, { useState } from 'react'

export default function Signup({ onClose }){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email || !password) return alert('Email and password are required')
    setLoading(true)
    try{
      const res = await fetch('/api/auth/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          role: 'caregiver'  // or 'doctor'
        }) 
      })
      const data = await res.json()
      setLoading(false)
      if (res.ok) {
        alert('Registration successful! Please sign in.')
        onClose && onClose()
      } else {
        alert('Registration failed: ' + (data.message || 'Unknown error'))
      }
    }catch(e){
      setLoading(false)
      alert('Failed to signup: ' + e.message)
    }
  }

  return (
    // GANTI INLINE STYLES DENGAN CLASSNAME
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create an account</h3>
        <p>Sign up to access Doctor Stroke</p>
        <input placeholder='Full name (optional)' value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type='password' placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={submit} className="btn-submit">{loading ? '...' : 'Sign up'}</button>
        </div>
      </div>
    </div>
  )
}