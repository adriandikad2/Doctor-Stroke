import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Patients = () => {
  const { authToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (authToken) {
      loadPatients();
    }
  }, [authToken]);

  const loadPatients = async () => {
    try {
      setLoading(true);
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
      } else {
        setError(data.message || 'Failed to load patients');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
    <div className="patients-page" style={{
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
        }}>👥 My Care Recipients</h1>
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
          }}>No Patients Linked</h3>
          <p style={{
            margin: '0',
            color: '#64748b',
            fontSize: '14px'
          }}>
            You haven't been added to any patient's care team yet. Contact your healthcare provider for assistance.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {patients.map(patient => (
            <div key={patient.patient_id} className="patient-card" style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>👤</div>
                <div>
                  <h3 style={{
                    margin: '0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>{patient.name}</h3>
                  <p style={{
                    margin: '0',
                    color: '#64748b',
                    fontSize: '12px'
                  }}>ID: {patient.unique_code}</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '12px',
                    color: '#94a3b8',
                    fontWeight: '500'
                  }}>DOB</p>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: '#334155'
                  }}>
                    {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '12px',
                    color: '#94a3b8',
                    fontWeight: '500'
                  }}>Gender</p>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: '#334155'
                  }}>
                    {patient.gender || 'Not specified'}
                  </p>
                </div>
              </div>

              {patient.medical_history && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '12px',
                    color: '#94a3b8',
                    fontWeight: '500'
                  }}>Medical History</p>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: '#334155',
                    lineHeight: '1.4'
                  }}>
                    {patient.medical_history}
                  </p>
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px'
              }}>
                <button
                  onClick={() => setSelectedPatient(patient)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setSelectedPatient(null)}
        >
          <div className="modal-content" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: 'min(90%, 600px)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                margin: '0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#334155'
              }}>Patient Details</h2>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                color: '#94a3b8',
                fontWeight: '500'
              }}>Name</p>
              <p style={{
                margin: '0',
                fontSize: '16px',
                color: '#334155'
              }}>{selectedPatient.name}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                color: '#94a3b8',
                fontWeight: '500'
              }}>Date of Birth</p>
              <p style={{
                margin: '0',
                fontSize: '16px',
                color: '#334155'
              }}>
                {selectedPatient.date_of_birth ? new Date(selectedPatient.date_of_birth).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                color: '#94a3b8',
                fontWeight: '500'
              }}>Gender</p>
              <p style={{
                margin: '0',
                fontSize: '16px',
                color: '#334155'
              }}>{selectedPatient.gender || 'Not specified'}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                color: '#94a3b8',
                fontWeight: '500'
              }}>Unique Code</p>
              <p style={{
                margin: '0',
                fontSize: '16px',
                color: '#334155',
                fontFamily: 'monospace',
                backgroundColor: '#f8fafc',
                padding: '8px 12px',
                borderRadius: '6px'
              }}>{selectedPatient.unique_code}</p>
            </div>

            {selectedPatient.medical_history && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '14px',
                  color: '#94a3b8',
                  fontWeight: '500'
                }}>Medical History</p>
                <p style={{
                  margin: '0',
                  fontSize: '16px',
                  color: '#334155',
                  lineHeight: '1.6'
                }}>{selectedPatient.medical_history}</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;