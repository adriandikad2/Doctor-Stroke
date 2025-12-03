import React, { useState, useEffect } from 'react'
import { appointmentAPI, patientAPI } from './utils/api'

export default function Scheduler({ user }){
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('consultation')
  const [loading, setLoading] = useState(false)
  const [mySlots, setMySlots] = useState([])
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients
        try {
          const patientsResp = await patientAPI.getMyPatients()
          if (patientsResp.success) {
            const patientsList = Array.isArray(patientsResp.data) ? patientsResp.data : []
            setPatients(patientsList)
          }
        } catch (err) {
          console.error('Error fetching patients:', err)
          setPatients([])
        }

        // Fetch my slots
        try {
          const slotsResp = await appointmentAPI.getMySlots()
          if (slotsResp.success) {
            const slotsList = Array.isArray(slotsResp.data) ? slotsResp.data : []
            setMySlots(slotsList)
          }
        } catch (err) {
          console.error('Error fetching slots:', err)
          setMySlots([])
        }

        // Fetch appointments
        try {
          const appointsResp = await appointmentAPI.getMyAppointments()
          if (appointsResp.success) {
            const appointmentsList = Array.isArray(appointsResp.data) ? appointsResp.data : []
            setAppointments(appointmentsList)
          }
        } catch (err) {
          console.error('Error fetching appointments:', err)
          setAppointments([])
        }
      } catch (err) {
        setError('Failed to load scheduler data')
        console.error('Scheduler error:', err)
      }
    }

    fetchData()
  }, [])

  const handleCreateSlot = async () => {
    if (!startTime || !endTime) {
      setError('Please select both start and end time')
      return
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) {
      setError('End time must be after start time')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await appointmentAPI.createSlot({
<<<<<<< HEAD
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        appointment_type: appointmentType
=======
        start_time: start.toISOString(),
        end_time: end.toISOString()
>>>>>>> af5ad3914129dacc9a4d1276ccfde98d9512f42f
      })

      if (response.success) {
        setSuccess('✓ Availability slot created successfully!')
        setStartTime('')
        setEndTime('')
        setAppointmentType('consultation')
        
        // Refresh slots
        const slotsResp = await appointmentAPI.getMySlots()
        if (slotsResp.success && slotsResp.data) {
          setMySlots(slotsResp.data)
        }
      } else {
        setError(response.message || 'Failed to create slot')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="scheduler" style={{ marginTop: 20 }}>
      <h3>📅 Patient Appointment Management</h3>
      
      {error && <div style={{ 
        color: '#d32f2f', 
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
      }}>{error}</div>}

      {success && <div style={{ 
        color: '#388e3c', 
        backgroundColor: 'rgba(56, 142, 60, 0.1)',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
      }}>{success}</div>}

      <div style={{ display:'grid', gridTemplateColumns: 'minmax(300px, 1fr) 240px', gap: 16 }}>
        {/* Create Slot Form */}
        <div className="form-card">
          <h4 style={{ marginTop: 0, marginBottom: '16px' }}>Create Availability Slot</h4>
          <div style={{ display:'grid', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Appointment Type</label>
              <select 
                value={appointmentType} 
                onChange={(e)=> setAppointmentType(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="consultation">Consultation</option>
                <option value="therapy">Therapy</option>
                <option value="follow-up">Follow-up</option>
                <option value="assessment">Assessment</option>
                <option value="rehabilitation">Rehabilitation</option>
                <option value="checkup">Checkup</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Start Time</label>
              <input 
                type='datetime-local' 
                value={startTime} 
                onChange={(e)=> setStartTime(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>End Time</label>
              <input 
                type='datetime-local' 
                value={endTime} 
                onChange={(e)=> setEndTime(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <button 
              onClick={handleCreateSlot} 
              disabled={loading}
              style={{ 
                padding:'10px 14px', 
                borderRadius: 10, 
                background: 'var(--blue)', 
                color:'white', 
                border:'none',
                marginBottom: 0,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creating...' : '➕ Create Slot'}
            </button>
          </div>
        </div>

        {/* My Available Slots */}
        <div className="form-card">
          <h4 style={{ marginTop:0, marginBottom: '12px' }}>My Slots</h4>
          {mySlots.length === 0 ? (
            <p style={{ color:'var(--color-muted-2)', margin: 0 }}>No slots created yet</p>
          ) : (
            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
              {mySlots.slice(0, 5).map(slot => (
                <li key={slot.slot_id} style={{ padding: 8, borderBottom:'1px solid var(--color-border)', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(slot.start_time).toLocaleTimeString()}
                  </div>
                  <div style={{ color:'var(--color-muted-2)', fontSize: '11px' }}>
                    {slot.appointment_type || 'appointment'}
                  </div>
                  <div style={{ color:'var(--color-muted-2)' }}>
                    Status: {slot.is_booked ? '✓ Booked' : '○ Available'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div style={{ marginTop: 24 }}>
        <h4 style={{ marginBottom: '16px' }}>📋 Upcoming Appointments</h4>
        {appointments.length === 0 ? (
          <p style={{ color:'var(--color-muted-2)' }}>No appointments scheduled</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {appointments.map(appt => (
              <div 
                key={appt.appointment_id} 
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>
                  {appt.patient?.name || 'Unknown Patient'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted-2)', marginBottom: '6px' }}>
                  📅 {new Date(appt.slot?.start_time).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted-2)', marginBottom: '6px' }}>
                  ⏱️ Duration: {Math.round((new Date(appt.slot?.end_time) - new Date(appt.slot?.start_time)) / 60000)} mins
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  padding: '6px 8px',
                  backgroundColor: appt.status === 'completed' ? 'rgba(56, 142, 60, 0.1)' : 'rgba(104, 161, 209, 0.1)',
                  color: appt.status === 'completed' ? '#388e3c' : '#68A1D1',
                  borderRadius: '4px',
                  display: 'inline-block',
                  fontWeight: 600
                }}>
                  {appt.status?.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}