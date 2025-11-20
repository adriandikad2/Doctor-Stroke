import React, { useState, useEffect } from 'react';
import { patientAPI, appointmentAPI } from './utils/api';

export default function Dashboard({ user }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch patients linked to current doctor/therapist
        const patientsResponse = await patientAPI.getMyPatients();
        if (patientsResponse.success && patientsResponse.data) {
          setPatients(patientsResponse.data);
          
          // Set first patient as selected by default
          if (patientsResponse.data.length > 0) {
            setSelectedPatient(patientsResponse.data[0]);
          }
        }

        // Fetch appointments
        const appointmentsResponse = await appointmentAPI.getMyAppointments();
        if (appointmentsResponse.success && appointmentsResponse.data) {
          setAppointments(appointmentsResponse.data);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div className="loading-spinner" style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid var(--color-border)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '12px', color: 'var(--color-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: '#d32f2f' }}>⚠️ {error}</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="dashboard" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h3>No Patients Linked</h3>
        <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
          You haven't linked any patients yet. Use the "Link Patient" button to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes progressFill {
          from {
            width: 0;
          }
          to {
            width: var(--progress-value);
          }
        }

        .dashboard {
          animation: fadeIn 0.5s ease-in-out;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          margin-bottom: 32px;
          animation: slideInUp 0.6s ease-out;
        }

        .dashboard-header h2 {
          font-size: 28px;
          color: var(--primary);
          margin: 0 0 8px 0;
          font-weight: 700;
        }

        .dashboard-header p {
          color: var(--color-muted);
          margin: 0;
          font-size: 14px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .card {
          background: var(--color-card);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 12px 30px rgba(14, 30, 45, 0.06);
          border: 1px solid var(--color-border);
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }
        .card:nth-child(4) { animation-delay: 0.4s; }

        .card h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: var(--primary);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-icon {
          font-size: 20px;
          display: inline-block;
        }

        .medication-item {
          padding: 12px;
          margin-bottom: 8px;
          background: var(--color-bg);
          border-radius: 8px;
          border-left: 4px solid var(--blue);
          transition: all 0.3s ease;
        }

        .medication-item:hover {
          box-shadow: 0 4px 12px rgba(104, 161, 209, 0.15);
          transform: translateX(4px);
        }

        .medication-item .med-name {
          font-weight: 600;
          color: var(--color-text);
          margin: 0 0 4px 0;
        }

        .medication-item .med-details {
          font-size: 12px;
          color: var(--color-muted-2);
          margin: 0;
        }

        .medication-item .med-last {
          font-size: 11px;
          color: var(--green);
          margin-top: 4px;
          font-weight: 500;
        }

        .event-item {
          padding: 12px;
          margin-bottom: 8px;
          background: var(--color-bg);
          border-radius: 8px;
          border-left: 4px solid var(--teal);
          transition: all 0.3s ease;
        }

        .event-item:hover {
          box-shadow: 0 4px 12px rgba(121, 174, 179, 0.15);
          transform: translateX(4px);
        }

        .event-item .event-title {
          font-weight: 600;
          color: var(--color-text);
          margin: 0 0 4px 0;
        }

        .event-item .event-time {
          font-size: 12px;
          color: var(--color-muted-2);
          margin: 0;
        }

        .event-item .event-location {
          font-size: 11px;
          color: var(--primary);
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .progress-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .progress-card {
          background: var(--color-card);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 12px 30px rgba(14, 30, 45, 0.06);
          border: 1px solid var(--color-border);
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .progress-card:nth-child(1) { animation-delay: 0.5s; }
        .progress-card:nth-child(2) { animation-delay: 0.6s; }
        .progress-card:nth-child(3) { animation-delay: 0.7s; }
        .progress-card:nth-child(4) { animation-delay: 0.8s; }

        .progress-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-muted);
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .progress-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary);
          margin: 0 0 12px 0;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--color-bg);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          animation: progressFill 1s ease-out forwards;
          background: linear-gradient(90deg, var(--blue), var(--teal));
        }

        .progress-bar.green .progress-fill {
          background: linear-gradient(90deg, var(--green), var(--teal));
        }

        .progress-bar.lavender .progress-fill {
          background: linear-gradient(90deg, var(--lavender), var(--primary));
        }

        .progress-label {
          font-size: 12px;
          color: var(--color-muted-2);
          text-align: right;
        }

        .activities-container {
          background: var(--color-card);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 12px 30px rgba(14, 30, 45, 0.06);
          border: 1px solid var(--color-border);
          animation: slideInUp 0.6s ease-out 0.9s forwards;
          opacity: 0;
        }

        .activities-container h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: var(--primary);
          font-weight: 700;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          background: var(--color-bg);
          border-radius: 8px;
          border-left: 3px solid var(--primary);
          animation: slideInLeft 0.4s ease-out forwards;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          box-shadow: 0 4px 12px rgba(131, 133, 204, 0.1);
          transform: translateX(4px);
        }

        .activity-item:nth-child(1) { animation-delay: 1s; }
        .activity-item:nth-child(2) { animation-delay: 1.1s; }
        .activity-item:nth-child(3) { animation-delay: 1.2s; }
        .activity-item:nth-child(4) { animation-delay: 1.3s; }

        .activity-icon {
          font-size: 20px;
          min-width: 24px;
          text-align: center;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          margin: 0;
          font-weight: 500;
          color: var(--color-text);
          font-size: 14px;
        }

        .activity-time {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: var(--color-muted-2);
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 12px;
          }

          .dashboard-header h2 {
            font-size: 24px;
          }

          .dashboard-grid,
          .progress-container {
            grid-template-columns: 1fr;
          }

          .progress-value {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="dashboard-header">
        <h2>📊 Patient Dashboard</h2>
        <p>Manage and monitor your patients' health status</p>
        
        {/* Patient Selector */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: '500', fontSize: '14px' }}>Select Patient:</label>
          <select 
            value={selectedPatient?.patient_id || ''}
            onChange={(e) => {
              const patient = patients.find(p => p.patient_id === e.target.value);
              setSelectedPatient(patient);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-text)',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            {patients.map(patient => (
              <option key={patient.patient_id} value={patient.patient_id}>
                {patient.name || 'Unknown Patient'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPatient && (
        <>
          <div style={{ 
            backgroundColor: 'var(--color-bg)', 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Patient Info</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--color-muted)' }}>Name</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600' }}>{selectedPatient.name}</p>
              </div>
              <div>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--color-muted)' }}>Date of Birth</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600' }}>
                  {selectedPatient.date_of_birth ? new Date(selectedPatient.date_of_birth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--color-muted)' }}>Gender</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600' }}>{selectedPatient.gender || 'N/A'}</p>
              </div>
              <div>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--color-muted)' }}>Unique Code</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600' }}>
                  <code style={{ 
                    backgroundColor: 'var(--color-card)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>{selectedPatient.unique_code}</code>
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Appointments for Patient */}
            <div className="card">
              <h3><span className="card-icon">📅</span>Upcoming Appointments</h3>
              {appointments.filter(a => a.patient_id === selectedPatient.patient_id).length > 0 ? (
                appointments.filter(a => a.patient_id === selectedPatient.patient_id).slice(0, 3).map((event) => (
                  <div key={event.appointment_id} className="event-item">
                    <p className="event-title">{event.patient?.name || 'Appointment'}</p>
                    <p className="event-time">⏰ {new Date(event.created_at).toLocaleString()}</p>
                    <p className="event-location">📍 Status: {event.status}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--color-muted-2)', margin: 0 }}>No upcoming appointments</p>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="card">
              <h3><span className="card-icon">📊</span>Quick Stats</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Patient Status</span>
                    <span style={{ fontSize: '12px', color: 'var(--green)' }}>✓ Active</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Linked Since</span>
                    <span style={{ fontSize: '12px', color: 'var(--blue)' }}>
                      {selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History Card */}
            <div className="card">
              <h3><span className="card-icon">📋</span>Medical History</h3>
              {selectedPatient.medical_history ? (
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                  {selectedPatient.medical_history}
                </p>
              ) : (
                <p style={{ color: 'var(--color-muted-2)', margin: 0 }}>No medical history recorded</p>
              )}
            </div>
          </div>

          {/* Recovery Progress Section */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '16px', fontWeight: 700 }}>
              🎯 Recovery Overview
            </h2>
            <div className="progress-container">
              <div className="progress-card">
                <p className="progress-title">Overall Status</p>
                <p className="progress-value">Good</p>
                <p className="progress-label">Patient is making steady progress</p>
              </div>

              <div className="progress-card">
                <p className="progress-title">Last Update</p>
                <p className="progress-value" style={{ fontSize: '14px' }}>
                  {new Date().toLocaleDateString()}
                </p>
                <p className="progress-label">Updated today</p>
              </div>

              <div className="progress-card">
                <p className="progress-title">Care Team</p>
                <p className="progress-value" style={{ fontSize: '14px' }}>1</p>
                <p className="progress-label">Care providers assigned</p>
              </div>

              <div className="progress-card">
                <p className="progress-title">Actions</p>
                <button style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
