import React, { useState, useEffect } from 'react';
import { medicationCatalogAPI, patientAPI } from './utils/api';

export default function MedicationAdherence({ user }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [adherenceData, setAdherenceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(30); // days

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getMyPatients();
      if (response.success) {
        const list = Array.isArray(response.data) ? response.data : [];
        setPatients(list);
        if (list.length > 0) {
          setSelectedPatient(list[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Gagal memuat data pasien');
    }
  };

  const fetchAdherence = async (patientId) => {
    setLoading(true);
    setError('');
    try {
      const response = await medicationCatalogAPI.getAdherence(patientId, timeRange);
      if (response.success) {
        setAdherenceData(response.data || {});
      } else {
        setError('Gagal memuat data adherence');
        setAdherenceData({});
      }
    } catch (err) {
      console.error('Error fetching adherence:', err);
      setError(err.message || 'Terjadi kesalahan');
      setAdherenceData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient?.patient_id) {
      fetchAdherence(selectedPatient.patient_id);
    }
  }, [selectedPatient, timeRange]);

  // Calculate overall stats
  const calculateStats = () => {
    const stats = {
      totalMedications: 0,
      totalDoses: 0,
      takenDoses: 0,
      missedDoses: 0,
      delayedDoses: 0,
      adherencePercentage: 0
    };

    Object.values(adherenceData).forEach(med => {
      if (med.total) {
        stats.totalMedications += 1;
        stats.totalDoses += med.total;
        stats.takenDoses += med.taken || 0;
        stats.missedDoses += med.missed || 0;
        stats.delayedDoses += med.delayed || 0;
      }
    });

    if (stats.totalDoses > 0) {
      stats.adherencePercentage = Math.round((stats.takenDoses / stats.totalDoses) * 100);
    }

    return stats;
  };

  const stats = calculateStats();

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#333' }}>
          Monitoring Kepatuhan Obat
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
          Pantau kepatuhan pasien dalam minum obat
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {/* Patient Selection and Time Range */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
            Pilih Pasien
          </label>
          <select
            value={selectedPatient?.patient_id || ''}
            onChange={(e) => {
              const patient = patients.find(p => p.patient_id === e.target.value);
              setSelectedPatient(patient);
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            <option value="">-- Pilih Pasien --</option>
            {patients.map(p => (
              <option key={p.patient_id} value={p.patient_id}>
                {p.name || p.patient_name || 'Unknown'} ({p.unique_code || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
            Periode
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            <option value={7}>7 Hari Terakhir</option>
            <option value={14}>14 Hari Terakhir</option>
            <option value={30}>30 Hari Terakhir</option>
            <option value={60}>60 Hari Terakhir</option>
            <option value={90}>90 Hari Terakhir</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Overall Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#e3f2fd',
              borderRadius: '12px',
              border: '1px solid #90caf9'
            }}>
              <div style={{ fontSize: '12px', color: '#1565c0', fontWeight: '600', marginBottom: '8px' }}>
                TOTAL OBAT
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>
                {stats.totalMedications}
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#c8e6c9',
              borderRadius: '12px',
              border: '1px solid #81c784'
            }}>
              <div style={{ fontSize: '12px', color: '#2e7d32', fontWeight: '600', marginBottom: '8px' }}>
                KEPATUHAN
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>
                {stats.adherencePercentage}%
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#fff9c4',
              borderRadius: '12px',
              border: '1px solid #fff59d'
            }}>
              <div style={{ fontSize: '12px', color: '#f57f17', fontWeight: '600', marginBottom: '8px' }}>
                DIMINUM
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>
                {stats.takenDoses}/{stats.totalDoses}
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#ffccbc',
              borderRadius: '12px',
              border: '1px solid #ffab91'
            }}>
              <div style={{ fontSize: '12px', color: '#d84315', fontWeight: '600', marginBottom: '8px' }}>
                TERLEWAT
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>
                {stats.missedDoses}
              </div>
            </div>
          </div>

          {/* Medication Details */}
          {Object.keys(adherenceData).length > 0 ? (
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid #ddd',
                fontWeight: '600',
                color: '#333'
              }}>
                Detail Kepatuhan per Obat
              </div>

              <div style={{ padding: '16px' }}>
                {Object.entries(adherenceData).map(([medName, data], idx) => {
                  const percentage = data.total > 0 ? Math.round((data.taken / data.total) * 100) : 0;
                  
                  return (
                    <div key={idx} style={{ marginBottom: idx < Object.keys(adherenceData).length - 1 ? '24px' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#333' }}>{medName}</span>
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          {data.taken}/{data.total} dosis
                        </span>
                      </div>

                      {/* Bar Chart */}
                      <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: '8px' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: percentage >= 80 ? '#4caf50' : percentage >= 50 ? '#ffc107' : '#f44336',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>

                      {/* Stats */}
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
                        <span>
                          <strong style={{ color: '#4caf50' }}>Diminum:</strong> {data.taken || 0}
                        </span>
                        <span>
                          <strong style={{ color: '#f44336' }}>Terlewat:</strong> {data.missed || 0}
                        </span>
                        {data.delayed > 0 && (
                          <span>
                            <strong style={{ color: '#ffc107' }}>Terlambat:</strong> {data.delayed}
                          </span>
                        )}
                        <span>
                          <strong style={{ color: '#2196f3' }}>Kepatuhan:</strong> {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '40px 24px',
              backgroundColor: '#f5f5f5',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#999'
            }}>
              <p>Tidak ada data kepatuhan untuk periode ini</p>
              <p style={{ fontSize: '12px', margin: '8px 0 0 0' }}>
                Pastikan pasien sudah memiliki obat yang ditambahkan
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
