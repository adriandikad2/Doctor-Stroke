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
    setTimeout(() => {
      const appt = { id: Date.now(), patient, date, time, duration, notes }
      setAppointments((s) => [appt, ...s])
      setLoading(false)
      alert('Appointment scheduled (mock): ' + patient + ' — ' + date + ' ' + time)
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
        {/* Hapus inline styles dari input/select/textarea */}
        <div className="form-card">
          <div style={{ display:'grid', gap:8 }}>
            <input placeholder='Patient name' value={patient} onChange={(e)=>setPatient(e.target.value)} />
            <div style={{ display:'flex', gap:8 }}>
              <input type='date' value={date} onChange={(e)=>setDate(e.target.value)} style={{ flex:1, marginBottom: 0 }} />
              <input type='time' value={time} onChange={(e)=>setTime(e.target.value)} style={{ width:120, marginBottom: 0 }} />
            </div>
            <select value={duration} onChange={(e)=>setDuration(e.target.value)} style={{ width:140 }}>
              <option value='15'>15 min</option>
              <option value='30'>30 min</option>
              <option value='45'>45 min</option>
              <option value='60'>60 min</option>
            </select>
            <textarea placeholder='Notes (optional)' value={notes} onChange={(e)=>setNotes(e.target.value)} style={{ minHeight:80 }} />
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={submit} style={{ padding:'10px 14px', borderRadius:10, background:'var(--blue)', color:'white', border:'none', marginBottom: 0 }}>
                {loading ? 'Scheduling...' : 'Schedule (mock)'}
              </button>
            </div>
          </div>
        </div>

        <div className="form-card">
            <h4 style={{ marginTop:0 }}>Upcoming (mock)</h4>
            {appointments.length === 0 ? <p style={{ color:'var(--muted-2)' }}>No upcoming appointments.</p> : (
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {appointments.map(a => (
                  <li key={a.id} style={{ padding:8, borderBottom:'1px solid var(--color-border)' }}>
                    <div style={{ fontWeight:700 }}>{a.patient}</div>
                    <div style={{ color:'var(--color-muted-2)' }}>{a.date} {a.time} · {a.duration}min</div>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </section>
  )
}