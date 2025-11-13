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
      // Use the real backend auth endpoint
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
    <div style={{ position: 'fixed', left:0, right:0, top:0, bottom:0, background: 'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width: 'min(680px,90%)', background: 'white', borderRadius: 12, padding: 20 }}>
        <h3 style={{ marginTop:0, color:'#8385CC' }}>Create an account</h3>
        <p>Sign up to access Doctor Stroke</p>
        <input placeholder='Full name (optional)' value={name} onChange={(e)=>setName(e.target.value)} style={{ width:'100%', padding:10, marginBottom:10, borderRadius:8, border:'1px solid #e5e7eb' }} />
        <input placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width:'100%', padding:10, marginBottom:10, borderRadius:8, border:'1px solid #e5e7eb' }} />
        <input type='password' placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width:'100%', padding:10, marginBottom:10, borderRadius:8, border:'1px solid #e5e7eb' }} />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'10px 14px', borderRadius:10, border:'1px solid #8385CC', background:'transparent', color:'#8385CC' }}>Cancel</button>
          <button onClick={submit} style={{ padding:'10px 14px', borderRadius:10, border:'none', background:'#68A1D1', color:'white' }}>{loading ? '...' : 'Sign up'}</button>
        </div>
      </div>
    </div>
  )
}
