import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const StatusBadge = ({ status }) => {
  const map = { taken: '#16a34a', missed: '#dc2626', delayed: '#f59e0b' };
  return (
    <span style={{ background: map[status] || '#e2e8f0', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
};

const BarChart = ({ stats }) => {
  const items = Object.entries(stats || {});
  if (!items.length) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Belum ada data adherence.</p>;
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {items.map(([label, val]) => {
        const total = val.total || 1;
        const takenPct = Math.round(((val.taken || 0) / total) * 100);
        const missedPct = Math.round(((val.missed || 0) / total) * 100);
        return (
          <div key={label} style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{label}</div>
            <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', background: '#e2e8f0' }}>
              <div style={{ width: `${takenPct}%`, background: '#16a34a' }}></div>
              <div style={{ width: `${missedPct}%`, background: '#dc2626' }}></div>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Taken {takenPct}% · Missed {missedPct}%</div>
          </div>
        );
      })}
    </div>
  );
};

const Medications = () => {
  const { authToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [assignedMeds, setAssignedMeds] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authToken) loadPatients();
  }, [authToken]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients/me', {
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        const list = data.data || [];
        setPatients(list);
        setSelectedPatient(list[0] || null);
      } else {
        setError(data.message || 'Gagal memuat pasien');
      }
    } catch (e) {
      setError(e.message || 'Gagal memuat pasien');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedPatient) return;
    loadAssigned(selectedPatient.patient_id);
    loadCatalog();
    loadAdherence(selectedPatient.patient_id);
  }, [selectedPatient, authToken]);

  const loadAssigned = async (patientId) => {
    try {
      const res = await fetch(`/api/medication-catalogs/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) setAssignedMeds(data.data || []);
      else setAssignedMeds([]);
    } catch {
      setAssignedMeds([]);
    }
  };

  const loadCatalog = async () => {
    try {
      const res = await fetch('/api/medication-catalogs/all', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) setCatalog(data.data || []);
    } catch {
      /* ignore */
    }
  };

  const loadAdherence = async (patientId) => {
    try {
      const res = await fetch(`/api/medication-catalogs/adherence/${patientId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) setAdherenceStats(data.data || {});
      else setAdherenceStats({});
    } catch {
      setAdherenceStats({});
    }
  };

  const handleLog = async (patient_med_id, status) => {
    setMsg('');
    setError('');
    try {
      const payload = { patient_med_id, patient_id: selectedPatient.patient_id, status };
      const res = await fetch('/api/medication-catalogs/adherence/log', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Logged ${status}`);
        loadAdherence(selectedPatient.patient_id);
      } else {
        setError(data.message || 'Gagal menyimpan log');
      }
    } catch (e) {
      setError(e.message || 'Gagal menyimpan log');
    }
  };

  const catalogLookup = useMemo(
    () =>
      catalog.reduce((acc, item) => {
        acc[item.catalog_id] = item;
        return acc;
      }, {}),
    [catalog]
  );

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#8385CC' }}>💊 Medications</h1>
        <div>
          <select
            value={selectedPatient?.patient_id || ''}
            onChange={(e) => setSelectedPatient(patients.find((p) => p.patient_id === e.target.value))}
            style={{ 
              padding: '10px 12px', 
              borderRadius: '8px', 
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              color: '#111827',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            <option value="">-- Select Patient --</option>
            {patients.map((p) => (
              <option key={p.patient_id} value={p.patient_id}>
                {p.name} (ID: {p.unique_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#dc2626', marginBottom: '24px', fontSize: '14px' }}>
          ❌ {error}
        </div>
      )}
      {msg && (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#ecfeff', color: '#0f766e', marginBottom: '24px', fontSize: '14px' }}>
          ✓ {msg}
        </div>
      )}

      {!selectedPatient && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>👉</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#334155' }}>Select a Patient</h3>
          <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>Please select a patient from the dropdown to view medications.</p>
        </div>
      )}

      {selectedPatient && (
        <>
          {/* Medications Grid */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#334155' }}>Assigned Medications</h2>
            {assignedMeds.length === 0 ? (
              <div style={{ padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                No medications assigned yet
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {assignedMeds.map((pm) => {
                  const info = catalogLookup[pm.catalog_id] || pm.medication || {};
                  return (
                    <div key={pm.patient_med_id} style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.02)';
                    }}
                    >
                      {info.image_url ? (
                        <div style={{
                          width: '100%',
                          height: '180px',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <img 
                            src={info.image_url} 
                            alt={info.medication_name}
                            crossOrigin="anonymous"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div style="color: #94a3b8; fontSize: 12px; textAlign: center;">📦 Image unavailable</div>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '180px',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          fontSize: '12px'
                        }}>
                          📦 No image
                        </div>
                      )}
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#334155' }}>
                        {info.medication_name || 'Unknown'}
                      </h3>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                        {info.product_category}
                      </p>
                      <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#64748b' }}>
                        {info.manufacturer}
                      </p>
                      {info.description && (
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                          {info.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleLog(pm.patient_med_id, 'taken')}
                          style={{ 
                            flex: 1,
                            padding: '8px 12px',
                            background: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#15803d'}
                          onMouseOut={(e) => e.target.style.background = '#16a34a'}
                        >
                          ✓ Taken
                        </button>
                        <button 
                          onClick={() => handleLog(pm.patient_med_id, 'missed')}
                          style={{ 
                            flex: 1,
                            padding: '8px 12px',
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                          onMouseOut={(e) => e.target.style.background = '#dc2626'}
                        >
                          ✗ Missed
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adherence Chart */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#334155' }}>Adherence Tracker</h2>
            <BarChart stats={adherenceStats} />
          </div>
        </>
      )}
    </div>
  );
};

export default Medications;
