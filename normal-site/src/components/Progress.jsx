import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Progress = () => {
  const { authToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [adherenceData, setAdherenceData] = useState([]);
  const [snapshotData, setSnapshotData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientSelectorLoading, setPatientSelectorLoading] = useState(false);

  useEffect(() => {
    if (authToken) {
      loadPatients();
    }
  }, [authToken]);

  const loadPatients = async () => {
    try {
      setPatientSelectorLoading(true);
      setError('');
      
      const response = await fetch('/api/patients/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPatients(data.data || []);
        if (data.data && data.data.length > 0) {
          // Auto-select first patient
          setSelectedPatient(data.data[0]);
        }
      } else {
        setError(data.message || 'Failed to load patients');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setPatientSelectorLoading(false);
    }
  };

  const loadPatientData = async (patientId) => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Load progress data for the patient
      const [progressResponse, adherenceResponse, snapshotResponse] = await Promise.all([
        fetch(`/api/logs/progress/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/logs/adherence/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/logs/snapshot/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      const progressData = await progressResponse.json();
      const adherenceData = await adherenceResponse.json();
      const snapshotData = await snapshotResponse.json();
      
      if (progressResponse.ok) {
        setProgressLogs(progressData.data || []);
      } else {
        setProgressLogs([]);
      }
      
      if (adherenceResponse.ok) {
        setAdherenceData(adherenceData.data || []);
      } else {
        setAdherenceData([]);
      }
      
      if (snapshotResponse.ok) {
        setSnapshotData(snapshotData.data || []);
      } else {
        setSnapshotData([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      loadPatientData(selectedPatient.patient_id);
    }
  }, [selectedPatient, authToken]);

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.patient_id === patientId);
    setSelectedPatient(patient || null);
  };

  // Calculate adherence rate
  const calculateAdherenceRate = () => {
    if (adherenceData.length === 0) return 0;
    const takenCount = adherenceData.filter(log => log.taken === true).length;
    return Math.round((takenCount / adherenceData.length) * 100);
  };

  if (patientSelectorLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '500px',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #8385CC',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#64748b' }}>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page" style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          margin: '0',
          fontSize: '28px',
          fontWeight: '700',
          color: '#8385CC'
        }}>📊 My Progress Tracking</h1>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          marginBottom: '24px'
        }}>
          ❌ {error}
        </div>
      )}

      {patients.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px'
          }}>👋</div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#334155'
          }}>No patients found</h3>
          <p style={{
            margin: '0',
            color: '#64748b',
            fontSize: '14px'
          }}>
            Ask your doctor to add you to a patient's care team.
          </p>
        </div>
      ) : (
        <div>
          {/* Patient Selector */}
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <label htmlFor="patient-select" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#334155'
            }}>Select Patient</label>
            <select
              id="patient-select"
              value={selectedPatient?.patient_id || ''}
              onChange={handlePatientChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              {patients.map(patient => (
                <option key={patient.patient_id} value={patient.patient_id}>
                    {patient.name} (ID: {patient.unique_code})
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div>
              {loading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '40px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div className="spinner" style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #e2e8f0',
                      borderTop: '4px solid #8385CC',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#64748b' }}>Loading progress data...</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '24px' }}>
                  {/* Progress Overview Stats */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h2 style={{
                      margin: '0 0 20px 0',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span>📈</span> Progress Overview
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Medication Adherence</p>
                        <p style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: '#8385CC' }}>
                          {calculateAdherenceRate()}%
                        </p>
                      </div>
                      
                      <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Progress Records</p>
                        <p style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: '#8385CC' }}>
                          {progressLogs.length}
                        </p>
                      </div>
                      
                      <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Snapshot Records</p>
                        <p style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: '#8385CC' }}>
                          {snapshotData.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Logs */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h2 style={{
                      margin: '0 0 20px 0',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span>📝</span> Progress Logs
                    </h2>
                    
                    {progressLogs.length > 0 ? (
                      <div style={{ display: 'grid', gap: '16px' }}>
                        {progressLogs.slice(0, 5).map((log, index) => (
                          <div key={log.progress_log_id || index} style={{
                            padding: '16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📅</span>
                                <strong style={{ color: '#334155', fontSize: '14px' }}>
                                  {new Date(log.created_at || log.logged_date).toLocaleDateString()}
                                </strong>
                              </div>
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                              <p style={{ margin: '0', color: '#334155', lineHeight: '1.5' }}>
                                {log.note || 'No details provided'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                        No progress logs recorded for this patient yet.
                      </p>
                    )}
                  </div>

                  {/* Medication Adherence */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h2 style={{
                      margin: '0 0 20px 0',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span>💊</span> Medication Adherence
                    </h2>
                    
                    {adherenceData.length > 0 ? (
                      <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                          <p style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: '#8385CC' }}>
                            {calculateAdherenceRate()}%
                          </p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                            Current adherence rate
                          </p>
                        </div>
                        
                        {adherenceData.slice(0, 5).map((log, index) => (
                          <div key={log.adherence_log_id || index} style={{
                            padding: '16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <p style={{ margin: '0', color: '#334155', fontWeight: '500' }}>
                                {new Date(log.created_at || log.logged_date).toLocaleDateString()}
                              </p>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                                {log.medication_name || 'Medication'}
                              </p>
                            </div>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '12px', 
                              fontSize: '12px', 
                              fontWeight: '500',
                              backgroundColor: log.taken ? '#dcfce7' : '#fee2e2',
                              color: log.taken ? '#166534' : '#dc2626'
                            }}>
                              {log.taken ? 'Taken' : 'Missed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                        No medication adherence records for this patient yet.
                      </p>
                    )}
                  </div>

                  {/* Progress Snapshots */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h2 style={{
                      margin: '0 0 20px 0',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span>📷</span> Progress Snapshots
                    </h2>
                    
                    {snapshotData.length > 0 ? (
                      <div style={{ display: 'grid', gap: '16px' }}>
                        {snapshotData.slice(0, 5).map((snapshot, index) => (
                          <div key={snapshot.snapshot_id || index} style={{
                            padding: '16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📅</span>
                                <strong style={{ color: '#334155', fontSize: '14px' }}>
                                  {new Date(snapshot.created_at || snapshot.snapshot_date).toLocaleDateString()}
                                </strong>
                              </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                              {snapshot.notes && (
                                <div style={{ marginBottom: '8px' }}>
                                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Notes</p>
                                  <p style={{ margin: '0', color: '#334155', fontSize: '12px' }}>
                                    {snapshot.notes}
                                  </p>
                                </div>
                              )}
                              {snapshot.blood_pressure && (
                                <div>
                                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Blood Pressure</p>
                                  <p style={{ margin: '0', color: '#34155', fontWeight: '500' }}>
                                    {snapshot.blood_pressure}
                                  </p>
                                </div>
                              )}
                              {snapshot.mobility_score && (
                                <div>
                                  <p style={{ margin: '0 4px 0', fontSize: '12px', color: '#64748b' }}>Mobility Score</p>
                                  <p style={{ margin: '0', color: '#334155', fontWeight: '500' }}>
                                    {snapshot.mobility_score}%
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                        No progress snapshots recorded for this patient yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Progress;