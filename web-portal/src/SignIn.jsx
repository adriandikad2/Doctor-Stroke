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
        // Store the token
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
    <div style={{ position: 'fixed', left:0, right:0, top:0, bottom:0, background: 'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width: 'min(420px,94%)', background: 'white', borderRadius: 12, padding: 18 }}>
        <h3 style={{ marginTop:0, color:'#8385CC' }}>Sign in</h3>
        <p>Sign in to access clinician features</p>
        <input placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width:'100%', padding:10, marginBottom:10, borderRadius:8, border:'1px solid #e5e7eb' }} />
        <input type='password' placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width:'100%', padding:10, marginBottom:10, borderRadius:8, border:'1px solid #e5e7eb' }} />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'10px 14px', borderRadius:10, border:'1px solid #8385CC', background:'transparent', color:'#8385CC' }}>Cancel</button>
          <button onClick={submit} style={{ padding:'10px 14px', borderRadius:10, border:'none', background:'#68A1D1', color:'white' }}>{loading ? '...' : 'Sign in'}</button>
        </div>
      </div>
    </div>
  )
}
