import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Appointments = () => {
  const { authToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authToken) {
      fetchPatients();
    }
  }, [authToken]);

  useEffect(() => {
    const patient = patients.find((p) => p.patient_id === selectedPatientId);
    if (!patient) {
      setProviders([]);
      setSelectedProviderId('');
      return;
    }

    const linkedProviders = (patient.care_team_links || [])
      .map((link) => link.user)
      .filter((u) => u?.role === 'doctor' || u?.role === 'therapist');

    setProviders(linkedProviders);
    setSelectedProviderId(linkedProviders[0]?.user_id || '');
  }, [patients, selectedPatientId]);

  useEffect(() => {
    if (selectedProviderId) {
      fetchSlots(selectedProviderId);
    } else {
      setSlots([]);
      setSelectedSlotId('');
    }
  }, [selectedProviderId]);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/patients/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data.data) ? data.data : [];
        setPatients(list);
        setSelectedPatientId(list[0]?.patient_id || '');
      } else {
        setError(data.message || 'Gagal memuat pasien');
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat pasien');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (providerId) => {
    try {
      const res = await fetch(`/api/appointments/slots/${providerId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        const available = (data.data || []).filter((slot) => !slot.is_booked);
        setSlots(available);
        setSelectedSlotId(available[0]?.slot_id || '');
      } else {
        setSlots([]);
        setSelectedSlotId('');
        setMessage('');
        setError(data.message || 'Tidak ada slot tersedia');
      }
    } catch (err) {
      setSlots([]);
      setSelectedSlotId('');
      setError(err.message || 'Gagal memuat slot');
    }
  };

  const handleBook = async () => {
    if (!selectedPatientId || !selectedSlotId) {
      setError('Pilih pasien dan slot terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slot_id: selectedSlotId,
          patient_id: selectedPatientId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Berhasil memesan janji pada slot yang dipilih');
        fetchSlots(selectedProviderId);
      } else {
        setError(data.message || 'Gagal memesan janji');
      }
    } catch (err) {
      setError(err.message || 'Gagal memesan janji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 16px', color: '#111827' }}>Appointment Booking</h1>
      <p style={{ margin: '0 0 20px', color: '#4b5563' }}>
        Pilih pasien dan penyedia (dokter/terapis), lalu pesan salah satu slot 30 menit yang sudah disiapkan.
      </p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ background: '#ecfeff', color: '#0f766e', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px', background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Pasien</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', cursor: 'pointer', backgroundColor: '#fff', fontSize: '14px' }}
          >
            <option value="">-- Select Patient --</option>
            {patients.map((p) => (
              <option key={p.patient_id} value={p.patient_id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Dokter/Terapis</span>
          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', cursor: 'pointer', backgroundColor: '#fff', fontSize: '14px' }}
          >
            <option value="">-- Select Provider --</option>
            {providers.map((provider) => (
              <option key={provider.user_id} value={provider.user_id}>
                {provider.doctor_profile?.first_name || provider.therapist_profile?.first_name || provider.email}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Slot tersedia</span>
          <select
            value={selectedSlotId}
            onChange={(e) => setSelectedSlotId(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', cursor: 'pointer', backgroundColor: '#fff', fontSize: '14px' }}
          >
            {slots.length === 0 && <option value="">Tidak ada slot</option>}
            {slots.map((slot) => {
              const start = new Date(slot.start_time);
              const end = new Date(slot.end_time);
              return (
                <option key={slot.slot_id} value={slot.slot_id}>
                  {start.toLocaleDateString()} • {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </option>
              );
            })}
          </select>
        </label>

        <button
          type="button"
          onClick={handleBook}
          disabled={loading || !selectedSlotId}
          style={{
            padding: '12px',
            background: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Memproses...' : 'Pesan Slot'}
        </button>
      </div>
    </div>
  );
};

export default Appointments;
