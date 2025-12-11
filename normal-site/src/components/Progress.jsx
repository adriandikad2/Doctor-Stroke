import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Progress = () => {
  const { authToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    mood: '',
    notes: '',
  });

  useEffect(() => {
    if (authToken) loadPatients();
  }, [authToken]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients/me', { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (res.ok) {
        const list = data.data || [];
        setPatients(list);
        setSelectedPatient(list[0] || null);
      }
    } catch (e) {
      setError(e.message || 'Gagal memuat pasien');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) loadVitals(selectedPatient.patient_id);
  }, [selectedPatient, authToken]);

  const loadVitals = async (patientId) => {
    try {
      const res = await fetch(`/api/progress/vitals/${patientId}?days=30`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) setVitals(data.data?.bloodPressureTrend || []);
      else setVitals([]);
    } catch {
      setVitals([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const res = await fetch('/api/progress/vitals', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.patient_id,
          bloodPressureSystolic: form.bloodPressureSystolic ? Number(form.bloodPressureSystolic) : undefined,
          bloodPressureDiastolic: form.bloodPressureDiastolic ? Number(form.bloodPressureDiastolic) : undefined,
          mood: form.mood,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Snapshot tersimpan');
        setForm({ bloodPressureSystolic: '', bloodPressureDiastolic: '', mood: '', notes: '' });
        loadVitals(selectedPatient.patient_id);
      } else {
        setError(data.message || 'Gagal menyimpan');
      }
    } catch (e) {
      setError(e.message || 'Gagal menyimpan');
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, color: '#0f172a' }}>Progress & Vitals</h1>
        <select
          value={selectedPatient?.patient_id || ''}
          onChange={(e) => setSelectedPatient(patients.find((p) => p.patient_id === e.target.value))}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', width: '200px', cursor: 'pointer', backgroundColor: '#fff', fontSize: '14px' }}
        >
          <option value="">-- Select Patient --</option>
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
      {msg && <div style={{ background: '#ecfeff', color: '#0f766e', padding: 12, borderRadius: 8, marginBottom: 12 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <form onSubmit={handleSubmit} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
          <h3 style={{ marginTop: 0 }}>Input snapshot harian</h3>
          <label style={labelStyle}>
            Systolic
            <input
              type="number"
              value={form.bloodPressureSystolic}
              onChange={(e) => setForm((p) => ({ ...p, bloodPressureSystolic: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Diastolic
            <input
              type="number"
              value={form.bloodPressureDiastolic}
              onChange={(e) => setForm((p) => ({ ...p, bloodPressureDiastolic: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Mood
            <input
              type="text"
              value={form.mood}
              onChange={(e) => setForm((p) => ({ ...p, mood: e.target.value }))}
              style={inputStyle}
              placeholder="calm / anxious / better"
            />
          </label>
          <label style={labelStyle}>
            Catatan
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              style={{ ...inputStyle, minHeight: 80 }}
            />
          </label>
          <button type="submit" style={{ padding: '10px 14px', background: '#8385CC', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            Simpan
          </button>
        </form>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
          <h3 style={{ marginTop: 0 }}>Grafik tekanan darah</h3>
          {vitals.length === 0 ? (
            <div style={{ color: '#94a3b8' }}>Belum ada data.</div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {vitals.map((v) => (
                <div key={v.time} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 120, color: '#475569', fontSize: 13 }}>{v.date}</div>
                  <div style={{ flex: 1, height: 10, background: '#e2e8f0', borderRadius: 8, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: `${Math.min(v.systolic, 200)}px`, top: -6, fontSize: 11, color: '#0f172a' }}>
                      {v.systolic}/{v.diastolic}
                    </div>
                    <div style={{ width: `${Math.min(v.systolic, 200)}px`, height: 10, background: '#38bdf8', borderRadius: 8 }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const labelStyle = { display: 'grid', gap: 6, fontSize: 13, marginBottom: 10, color: '#0f172a' };
const inputStyle = { padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 };

export default Progress;
