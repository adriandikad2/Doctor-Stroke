import React, { useState } from 'react'
import { authAPI } from './utils/api'

export default function Signup({ onClose }){
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('doctor')
  const [medicalLicense, setMedicalLicense] = useState('')
  const [specialization, setSpecialization] = useState('NEUROLOGIST')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const specializations = {
    doctor: ['NEUROLOGIST', 'PHYSIATRIST'],
    therapist: ['PHYSICAL', 'OCCUPATIONAL', 'RECREATIONAL', 'SPEECH', 'PSYCHOLOGIST', 'DIETITIAN']
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!firstName || !lastName || !email || !password) {
      setError('All basic fields are required')
      return
    }

    if (!medicalLicense) {
      setError(`${role === 'doctor' ? 'Medical' : 'License'} license is required`)
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await authAPI.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
        medical_license: medicalLicense,
        specialization: specialization
      })
      
      console.log('Signup response:', response);
      
      if (response.success) {
        setLoading(false)
        alert('Registration successful! Please sign in.')
        onClose && onClose()
      } else {
        setError(response.message || 'Registration failed')
        setLoading(false)
      }
    } catch(e) {
      console.error('Signup error:', e);
      setError(e.message || 'An error occurred during registration')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>Clinician Registration</h3>
        <p>Register as a healthcare professional to access clinical tools and patient management</p>
        
        {error && <div style={{ 
          color: '#d32f2f', 
          fontSize: '14px', 
          marginBottom: '12px',
          padding: '8px 12px',
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          borderRadius: '4px'
        }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Role</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['doctor', 'therapist'].map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="role" 
                    value={r} 
                    checked={role === r} 
                    onChange={(e) => {
                      setRole(e.target.value)
                      setSpecialization(specializations[e.target.value][0])
                    }}
                    disabled={loading}
                  />
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input 
              type="text"
              placeholder='First name' 
              value={firstName} 
              onChange={(e) => {
                setFirstName(e.target.value)
                setError('')
              }}
              disabled={loading}
            />
            <input 
              type="text"
              placeholder='Last name' 
              value={lastName} 
              onChange={(e) => {
                setLastName(e.target.value)
                setError('')
              }}
              disabled={loading}
            />
          </div>

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
            style={{ marginBottom: '12px' }}
          />

          <input 
            type="text"
            placeholder={`${role === 'doctor' ? 'Medical' : 'Professional'} License Number`} 
            value={medicalLicense} 
            onChange={(e) => {
              setMedicalLicense(e.target.value)
              setError('')
            }}
            disabled={loading}
            style={{ marginBottom: '12px' }}
          />

          <select 
            value={specialization} 
            onChange={(e) => setSpecialization(e.target.value)}
            disabled={loading}
            style={{ marginBottom: '16px' }}
          >
            <option value="">Select Specialization</option>
            {specializations[role].map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}