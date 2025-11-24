import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Medications = () => {
  const { authToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medications, setMedications] = useState([]);
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
      
      // Load medications for the patient
      const response = await fetch(`/api/prescriptions/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMedications(data.data || []);
      } else {
        setMedications([]);
        setError(data.message || 'Failed to load medications');
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
    <div className="medications-page" style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(360deg); }
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
        }}>💊 My Medications</h1>
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
                    <p style={{ color: '#64748b' }}>Loading medications...</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '24px' }}>
                  {/* Medications List */}
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
                      <span>📋</span> Current Medications
                    </h2>
                    
                    {medications.length > 0 ? (
                      <div style={{ display: 'grid', gap: '16px' }}>
                        {medications.map((med, index) => (
                          <div key={med.prescription_id || index} style={{
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
                                <span>💊</span>
                                <strong style={{ color: '#334155', fontSize: '16px' }}>{med.medication_name || 'Unnamed Medication'}</strong>
                              </div>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '12px', 
                                fontSize: '12px', 
                                fontWeight: '500',
                                backgroundColor: med.status === 'active' ? '#dcfce7' : '#fee2e2',
                                color: med.status === 'active' ? '#166534' : '#dc2626'
                              }}>
                                {med.status || 'Unknown'}
                              </span>
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Dosage</p>
                              <p style={{ margin: '0', color: '#334155' }}>
                                {med.dosage || 'Not specified'} {med.frequency ? ` - ${med.frequency}` : ''}
                              </p>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                              <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Start Date</p>
                                <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                  {med.start_date ? new Date(med.start_date).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              
                              <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>End Date</p>
                                <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                  {med.end_date ? new Date(med.end_date).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            {med.instructions && (
                              <div style={{ marginTop: '12px' }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Instructions</p>
                                <p style={{ margin: '0', color: '#334155', fontStyle: 'italic' }}>
                                  {med.instructions}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                        No medications prescribed for this patient yet.
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

export default Medications;