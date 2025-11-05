import React, { useState } from 'react'

export default function SignIn({ onClose, onSuccess }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = () => {
    if (!email || !password) return alert('Email and password required (mock)')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Signed in (mock): ' + email)
      onSuccess && onSuccess()
    }, 600)
  }

  return (
    <div style={{ position: 'fixed', left:0, right:0, top:0, bottom:0, background: 'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width: 'min(420px,94%)', background: 'white', borderRadius: 12, padding: 18 }}>
        <h3 style={{ marginTop:0, color:'#8385CC' }}>Sign in</h3>
        <p>Sign in to access clinician features (mock)</p>
        <input placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width:'100%', padding:10, marginBottom:10, borderRadius:8, border:'1px solid #e5e7eb' }} />
        <input placeholder='Password' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width:'100%', padding:10, marginBottom:10, borderRadius:8, border:'1px solid #e5e7eb' }} />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'10px 14px', borderRadius:10, border:'1px solid #8385CC', background:'transparent', color:'#8385CC' }} disabled={loading}>Cancel</button>
          <button onClick={submit} style={{ padding:'10px 14px', borderRadius:10, border:'none', background:'#68A1D1', color:'white' }} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>
      </div>
    </div>
  )
}
