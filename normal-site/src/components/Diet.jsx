import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BarChart = ({ stats }) => {
  const items = Object.entries(stats || {});
  if (!items.length) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Belum ada data kepatuhan.</p>;
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
              <div style={{ width: `${takenPct}%`, background: '#22c55e' }}></div>
              <div style={{ width: `${missedPct}%`, background: '#ef4444' }}></div>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Taken {takenPct}% · Missed {missedPct}%</div>
          </div>
        );
      })}
    </div>
  );
};

const Diet = () => {
  const { authToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [foods, setFoods] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [adherence, setAdherence] = useState({});
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
    loadFoods(selectedPatient.patient_id);
    loadCatalog();
    loadAdherence(selectedPatient.patient_id);
  }, [selectedPatient, authToken]);

  const loadFoods = async (patientId) => {
    try {
      const res = await fetch(`/api/nutrition-catalogs/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) setFoods(data.data || []);
      else setFoods([]);
    } catch {
      setFoods([]);
    }
  };

  const loadCatalog = async () => {
    try {
      const res = await fetch('/api/nutrition-catalogs/all', {
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
      const res = await fetch(`/api/nutrition-catalogs/adherence/${patientId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) setAdherence(data.data || {});
      else setAdherence({});
    } catch {
      setAdherence({});
    }
  };

  const handleLog = async (patient_food_id, status) => {
    setMsg('');
    setError('');
    try {
      const res = await fetch('/api/nutrition-catalogs/adherence/log', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_food_id, patient_id: selectedPatient.patient_id, status }),
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

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#8385CC' }}>🥗 Diet & Nutrition</h1>
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
          <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>Please select a patient from the dropdown to view diet information.</p>
        </div>
      )}

      {selectedPatient && (
        <>
          {/* Foods Grid */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#334155' }}>Assigned Diet Plans</h2>
            {foods.length === 0 ? (
              <div style={{ padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                No diet plans assigned yet
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {foods.map((pf) => {
                  const info = catalogLookup[pf.catalog_id] || pf.food || {};
                  return (
                    <div key={pf.patient_food_id} style={{
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
                      {info.image_url && (
                        <img src={info.image_url} alt={info.food_name} style={{ 
                          width: '100%', 
                          height: '180px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }} />
                      )}
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#334155' }}>
                        {info.food_name || 'Unknown'}
                      </h3>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8' }}>
                        {info.food_category} • {info.meal_type}
                      </p>
                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
                        ⚡ {info.calories || 0} kcal • 🧂 {info.sodium_mg || 0}mg Na
                      </p>
                      {info.description && (
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                          {info.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleLog(pf.patient_food_id, 'taken')}
                          style={{ 
                            flex: 1,
                            padding: '8px 12px',
                            background: '#22c55e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#16a34a'}
                          onMouseOut={(e) => e.target.style.background = '#22c55e'}
                        >
                          ✓ Taken
                        </button>
                        <button 
                          onClick={() => handleLog(pf.patient_food_id, 'missed')}
                          style={{ 
                            flex: 1,
                            padding: '8px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#dc2626'}
                          onMouseOut={(e) => e.target.style.background = '#ef4444'}
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

          {/* Compliance Chart */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#334155' }}>Compliance Tracker</h2>
            <BarChart stats={adherence} />
          </div>
        </>
      )}
    </div>
  );
};

export default Diet;
