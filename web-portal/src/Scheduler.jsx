import React, { useState } from 'react'

export default function Scheduler(){
  const [patient, setPatient] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState([])

  const submit = async () => {
    if (!patient || !date || !time) return alert('Please provide patient name, date and time')
    setLoading(true)
    // simulate backend call
    setTimeout(() => {
      const appt = { id: Date.now(), patient, date, time, duration, notes }
      setAppointments((s) => [appt, ...s])
      setLoading(false)
      // Mock response message
      alert('Appointment scheduled (mock): ' + patient + ' — ' + date + ' ' + time)
      // reset form
      setPatient('')
      setDate('')
      setTime('')
      setDuration('30')
      setNotes('')
    }, 700)
  }

  return (
    <section className="scheduler" style={{ marginTop: 20 }}>
      <h3>Scheduling (mock)</h3>
      <div style={{ display:'grid', gridTemplateColumns: '1fr 240px', gap: 12 }}>
        <div style={{ background:'var(--card)', padding:16, borderRadius:12, boxShadow:'0 12px 30px rgba(14,30,45,0.06)' }}>
          <div style={{ display:'grid', gap:8 }}>
            <input placeholder='Patient name' value={patient} onChange={(e)=>setPatient(e.target.value)} style={{ padding:10, borderRadius:8, border:'1px solid #e5e7eb' }} />
            <div style={{ display:'flex', gap:8 }}>
              <input type='date' value={date} onChange={(e)=>setDate(e.target.value)} style={{ padding:10, borderRadius:8, border:'1px solid #e5e7eb', flex:1 }} />
              <input type='time' value={time} onChange={(e)=>setTime(e.target.value)} style={{ padding:10, borderRadius:8, border:'1px solid #e5e7eb', width:120 }} />
            </div>
            <select value={duration} onChange={(e)=>setDuration(e.target.value)} style={{ padding:10, borderRadius:8, border:'1px solid #e5e7eb', width:140 }}>
              <option value='15'>15 min</option>
              <option value='30'>30 min</option>
              <option value='45'>45 min</option>
              <option value='60'>60 min</option>
            </select>
            <textarea placeholder='Notes (optional)' value={notes} onChange={(e)=>setNotes(e.target.value)} style={{ padding:10, borderRadius:8, border:'1px solid #e5e7eb', minHeight:80 }} />
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={submit} style={{ padding:'10px 14px', borderRadius:10, background:'var(--blue)', color:'white', border:'none' }}>{loading ? 'Scheduling...' : 'Schedule (mock)'}</button>
            </div>
          </div>
        </div>

        <div>
          <div style={{ background:'var(--card)', padding:12, borderRadius:12, boxShadow:'0 12px 30px rgba(14,30,45,0.06)' }}>
            <h4 style={{ marginTop:0 }}>Upcoming (mock)</h4>
            {appointments.length === 0 ? <p style={{ color:'var(--muted-2)' }}>No upcoming appointments.</p> : (
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {appointments.map(a => (
                  <li key={a.id} style={{ padding:8, borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ fontWeight:700 }}>{a.patient}</div>
                    <div style={{ color:'var(--muted-2)' }}>{a.date} {a.time} · {a.duration}min</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
