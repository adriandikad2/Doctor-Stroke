import React, { useState, useEffect } from 'react';
import { patientAPI, appointmentAPI, logAPI, insightAPI, nutritionAPI } from './utils/api';
import PrescriptionEntry from './components/PrescriptionEntry';
import MedicalHistoryLogger from './components/MedicalHistoryLogger';
import AIInsightPanel from './components/AIInsightPanel';
import ExerciseCatalogEntry from './components/ExerciseCatalogEntry';

export default function Dashboard({ user }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [insight, setInsight] = useState('');
  const [insightWarning, setInsightWarning] = useState('');
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [progressTab, setProgressTab] = useState('adherence');
  const [adherenceData, setAdherenceData] = useState([]);
  const [progressLogs, setProgressLogs] = useState([]);
  const [snapshotData, setSnapshotData] = useState([]);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch patients linked to current doctor/therapist
        try {
          const patientsResponse = await patientAPI.getMyPatients();
          console.log('Patients response:', patientsResponse);
          
          if (patientsResponse.success) {
            const patientsList = Array.isArray(patientsResponse.data) ? patientsResponse.data : [];
            setPatients(patientsList);
            
            // Set first patient as selected by default
            if (patientsList.length > 0) {
              setSelectedPatient(patientsList[0]);
            }
          } else {
            console.warn('Patients response not successful:', patientsResponse);
            setPatients([]);
          }
        } catch (err) {
          console.error('Error fetching patients:', err);
          setError(err.message || 'Failed to load patients');
          setPatients([]);
        }

        // Fetch appointments (non-blocking)
        try {
          const appointmentsResponse = await appointmentAPI.getMyAppointments();
          console.log('Appointments response:', appointmentsResponse);
          
          if (appointmentsResponse.success) {
            const appointmentsList = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
            // Filter upcoming appointments only
            const upcomingAppointments = appointmentsList.filter(apt => {
              const aptDate = new Date(apt.slot?.start_time || apt.created_at);
              return aptDate >= new Date();
            });
            setAppointments(upcomingAppointments);
          } else {
            setAppointments([]);
          }
        } catch (err) {
          console.error('Error fetching appointments:', err);
          // Don't set error for appointments - it's non-critical
          setAppointments([]);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchMedicalHistory = async () => {
    if (!selectedPatient?.patient_id) return;
    try {
      const response = await logAPI.snapshot.getByPatientId(selectedPatient.patient_id);
      if (response.success && response.data) {
        setMedicalHistory(response.data);
      } else {
        setMedicalHistory([]);
      }
    } catch (err) {
      console.error('Error fetching medical history:', err);
      setMedicalHistory([]);
    }
  };

  const groupAdherenceByMonth = (logs) => {
    const months = {};
    logs.forEach(log => {
      const date = new Date(log.logged_date || log.created_at);
      const monthKey = date.toLocaleString('default', { month: 'short' });

      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, total: 0, taken: 0 };
      }
      months[monthKey].total += 1;
      if (log.taken === true || log.taken === 'true') {
        months[monthKey].taken += 1;
      }
    });

    return Object.values(months)
      .slice(0, 6)
      .map(m => ({
        ...m,
        rate: m.total > 0 ? Math.round((m.taken / m.total) * 100) : 0
      }));
  };

  const getCurrentAdherenceRate = () => {
    if (adherenceData.length === 0) return 0;
    const lastMonth = adherenceData[adherenceData.length - 1];
    return lastMonth.rate || 0;
  };

  const getAverageAdherenceRate = () => {
    if (adherenceData.length === 0) return 0;
    const sum = adherenceData.reduce((acc, item) => acc + (item.rate || 0), 0);
    return Math.round(sum / adherenceData.length);
  };

  useEffect(() => {
    if (selectedPatient?.patient_id) {
      fetchMedicalHistory();
      fetchInsight(selectedPatient.patient_id);
      fetchProgressData();
      fetchNutritionData();
    }
  }, [selectedPatient, refreshTrigger]);

  // Polling to check for appointment updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const appointmentsResponse = await appointmentAPI.getMyAppointments();
        if (appointmentsResponse.success) {
          const appointmentsList = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
          const upcomingAppointments = appointmentsList.filter(apt => {
            const aptDate = new Date(apt.slot?.start_time || apt.created_at);
            return aptDate >= new Date();
          });
          setAppointments(upcomingAppointments);
        }
      } catch (err) {
        console.error('Error polling appointments:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchInsight = async (patientId) => {
    try {
      setInsightWarning('');
      const res = await insightAPI.getPatientSummary(patientId);
      const summaryText = typeof res?.data === 'string'
        ? res.data
        : res?.data?.summary || res?.data?.error || '';

      if (res?.message?.toLowerCase?.().includes('429') || res?.message?.toLowerCase?.().includes('quota')) {
        setInsightWarning('Gemini quota reached, menampilkan konteks terakhir. Coba lagi dalam beberapa saat.');
      }

      if (summaryText) {
        setInsight(summaryText);
      } else {
        setInsight('');
      }
    } catch (err) {
      console.error('Error fetching insight', err);
      setInsightWarning(err.message?.includes('429') ? 'Gemini sementara penuh, coba lagi sebentar lagi.' : 'Gagal memuat insight AI.');
      setInsight('');
    }
  };

  const fetchProgressData = async () => {
    if (!selectedPatient?.patient_id) return;

    try {
      setProgressLoading(true);
      setProgressError('');

      const [adherenceResponse, progressResponse, snapshotResponse] = await Promise.all([
        logAPI.adherence.getByPatientId(selectedPatient.patient_id).catch(() => ({ success: false })),
        logAPI.progress.getByPatientId(selectedPatient.patient_id).catch(() => ({ success: false })),
        logAPI.snapshot.getByPatientId(selectedPatient.patient_id).catch(() => ({ success: false })),
      ]);

      if (adherenceResponse.success && adherenceResponse.data) {
        setAdherenceData(groupAdherenceByMonth(adherenceResponse.data));
      } else {
        setAdherenceData([]);
      }

      if (progressResponse.success && progressResponse.data) {
        setProgressLogs(progressResponse.data);
      } else {
        setProgressLogs([]);
      }

      if (snapshotResponse.success && snapshotResponse.data) {
        setSnapshotData(snapshotResponse.data);
      } else {
        setSnapshotData([]);
      }
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setProgressError(err.message || 'Failed to fetch progress data');
      setAdherenceData([]);
      setProgressLogs([]);
      setSnapshotData([]);
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchNutritionData = async () => {
    if (!selectedPatient?.patient_id) return;
    try {
      const [profileResp, mealsResp] = await Promise.all([
        nutritionAPI.getProfile(selectedPatient.patient_id).catch(() => ({ success: false })),
        logAPI.meal.getByPatientId(selectedPatient.patient_id).catch(() => ({ success: false })),
      ]);

      if (profileResp.success && profileResp.data) {
        setNutritionProfile(profileResp.data);
      } else {
        setNutritionProfile(null);
      }

      if (mealsResp.success && mealsResp.data) {
        setMealLogs(mealsResp.data);
      } else {
        setMealLogs([]);
      }
    } catch (err) {
      console.error('Error fetching nutrition data', err);
      setNutritionProfile(null);
      setMealLogs([]);
    }
  };

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

        .progress-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          border-bottom: 2px solid var(--color-border);
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .progress-tab {
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: var(--color-muted);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .progress-tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .chart-card {
          background: var(--color-card);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 12px 30px rgba(14, 30, 45, 0.06);
          border: 1px solid var(--color-border);
          margin-bottom: 16px;
        }

        .chart-card h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: var(--primary);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .stat-item {
          background: var(--color-bg);
          padding: 14px;
          border-radius: 8px;
          border-left: 4px solid var(--primary);
        }

        .stat-item .label {
          font-size: 12px;
          color: var(--color-muted-2);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .stat-item .value {
          font-size: 24px;
          color: var(--primary);
          font-weight: 700;
          margin: 0;
        }

        .bar-row {
          margin-bottom: 10px;
        }

        .bar-row .title {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--color-muted-2);
          margin-bottom: 4px;
        }

        .bar-track {
          width: 100%;
          height: 8px;
          background: var(--color-bg);
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--blue), var(--teal));
          border-radius: 4px;
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
        <h2>Clinical Dashboard</h2>
        <p>Monitor and manage your patients' health status and treatment progress</p>
        
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

          {/* Prescription Management Section - For Doctors/Therapists */}
          {(user?.role === 'doctor' || user?.role === 'therapist') && (
            <PrescriptionEntry 
              patientId={selectedPatient.patient_id}
              user={user}
              onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}

          {/* Vital Signs Tracker - For Doctors/Therapists */}
          {(user?.role === 'doctor' || user?.role === 'therapist') && (
            <MedicalHistoryLogger 
              patientId={selectedPatient.patient_id}
              onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}

          {/* Exercise Catalog - For Therapists */}
          {user?.role === 'therapist' && (
            <ExerciseCatalogEntry 
              user={user}
              onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}

          {/* AI Clinical Insights Panel */}
          {selectedPatient && (
            <AIInsightPanel selectedPatient={selectedPatient} />
          )}

          <div className="dashboard-grid">
            <div className="card">
              <h3><span className="card-icon">📅</span>Upcoming Appointments</h3>
              {appointments.filter(a => a.patient_id === selectedPatient.patient_id).length > 0 ? (
                appointments.filter(a => a.patient_id === selectedPatient.patient_id).slice(0, 3).map((event) => (
                  <div key={event.appointment_id} className="event-item">
                    <p className="event-title">{event.patient?.name || 'Appointment'}</p>
                    <p className="event-time">⏰ {new Date(event.slot?.start_time || event.start_time || event.created_at).toLocaleString()}</p>
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
              {medicalHistory && medicalHistory.length > 0 ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {medicalHistory.slice(0, 3).map((record, idx) => (
                    <div key={record.snapshot_id || idx} style={{
                      padding: '8px',
                      background: 'var(--color-bg)',
                      borderRadius: '6px',
                      borderLeft: '3px solid var(--teal)',
                      fontSize: '12px'
                    }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--color-text)' }}>
                        {new Date(record.recorded_at || record.created_at).toLocaleDateString()}
                      </p>
                      {record.blood_pressure_systolic && (
                        <p style={{ margin: '0 0 2px 0', color: 'var(--color-muted-2)' }}>
                          🩸 BP: {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg
                        </p>
                      )}
                      {record.exercise_completed && (
                        <p style={{ margin: '0 0 2px 0', color: 'var(--green)' }}>
                          ✓ Exercise completed
                        </p>
                      )}
                      {record.notes && (
                        <p style={{ margin: 0, color: 'var(--color-muted-2)' }}>
                          📝 {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted-2)', margin: 0 }}>No medical history recorded. Use 🩺 Vital Signs Tracker to add records.</p>
              )}
            </div>

            {/* Nutrition Snapshot */}
            <div className="card">
              <h3><span className="card-icon">🥗</span>Nutrition Snapshot</h3>
              {nutritionProfile ? (
                <div style={{ fontSize: 12, color: 'var(--color-text)', display: 'grid', gap: 6 }}>
                  <div>Calorie Target: <strong>{nutritionProfile.calorie_target_max || '-'}</strong> kcal</div>
                  <div>Sodium Limit: <strong>{nutritionProfile.sodium_limit_mg || '-'}</strong> mg</div>
                  <div>Fiber Target: <strong>{nutritionProfile.fiber_target_g || '-'}</strong> g</div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted-2)', margin: 0, fontSize: 12 }}>No nutrition profile available</p>
              )}
              <div style={{ marginTop: 10 }}>
                <p style={{ margin: '0 0 6px 0', color: 'var(--color-muted)', fontSize: 12 }}>Latest meals</p>
                {mealLogs.length > 0 ? (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {mealLogs.slice(0, 3).map((meal, idx) => (
                      <div key={meal.meal_log_id || idx} style={{
                        padding: '8px',
                        background: 'var(--color-bg)',
                        borderRadius: '6px',
                        borderLeft: '3px solid var(--teal)',
                        fontSize: 12
                      }}>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(meal.logged_for || meal.created_at).toLocaleDateString()} • {meal.meal_type}
                        </div>
                        <div style={{ color: 'var(--color-muted-2)' }}>
                          {Array.isArray(meal.foods) ? meal.foods.join(', ') : meal.foods}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-muted-2)', margin: 0, fontSize: 12 }}>No meals recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Patient Progress & Recovery */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '10px', fontWeight: 700, display: 'flex', gap: '8px', alignItems: 'center' }}>
              📊 Patient Progress & Recovery
            </h2>
            <p style={{ margin: '0 0 12px 0', color: 'var(--color-muted-2)', fontSize: 13 }}>
              Adherence, therapy, dan vital terkini untuk pasien ini. Tambahkan log di Dashboard untuk melihat grafik terisi.
            </p>

            {progressError && (
              <div style={{
                background: '#FEE2E2',
                color: '#DC2626',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '13px',
                borderLeft: '4px solid #DC2626'
              }}>
                ❌ {progressError}
              </div>
            )}

            <div className="progress-tabs">
              {[
                { id: 'adherence', label: 'Medication Adherence', icon: '💊' },
                { id: 'therapy', label: 'Therapy Logs', icon: '🏥' },
                { id: 'vitals', label: 'Vitals & Snapshots', icon: '❤️' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`progress-tab ${progressTab === tab.id ? 'active' : ''}`}
                  onClick={() => setProgressTab(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {progressLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-muted-2)' }}>
                Loading progress data...
              </div>
            ) : (
              <>
                {progressTab === 'adherence' && (
                  <div className="chart-card">
                    <h3>💊 Medication Adherence</h3>
                    {adherenceData.length > 0 ? (
                      <>
                        <div style={{ display: 'grid', gap: '10px', marginBottom: '10px' }}>
                          {adherenceData.map((item) => (
                            <div key={item.month} className="bar-row">
                              <div className="title">
                                <span>{item.month}</span>
                                <span>{item.rate}%</span>
                              </div>
                              <div className="bar-track">
                                <div className="bar-fill" style={{ width: `${item.rate}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="stat-grid">
                          <div className="stat-item">
                            <div className="label">Current Rate</div>
                            <p className="value">{getCurrentAdherenceRate()}%</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted-2)' }}>Bulan terakhir</p>
                          </div>
                          <div className="stat-item">
                            <div className="label">Average</div>
                            <p className="value">{getAverageAdherenceRate()}%</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted-2)' }}>Rata-rata</p>
                          </div>
                          <div className="stat-item">
                            <div className="label">Tracked Doses</div>
                            <p className="value">{adherenceData.reduce((acc, m) => acc + m.total, 0)}</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted-2)' }}>Total catatan</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', color: 'var(--color-muted-2)', textAlign: 'center' }}>
                        📊 Belum ada data kepatuhan obat. Tambahkan log di resep/obat.
                      </div>
                    )}
                  </div>
                )}

                {progressTab === 'therapy' && (
                  <div className="chart-card">
                    <h3>🏥 Therapy Sessions</h3>
                    {progressLogs.length > 0 ? (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {progressLogs.map((log, idx) => (
                          <div key={log.progress_log_id || idx} style={{
                            padding: '12px',
                            background: 'var(--color-bg)',
                            borderRadius: '8px',
                            borderLeft: '4px solid var(--blue)'
                          }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--color-text)', fontSize: '13px' }}>
                              {new Date(log.logged_date || log.created_at).toLocaleDateString()}
                            </p>
                            <p style={{ margin: 0, color: 'var(--color-muted-2)', fontSize: '12px' }}>
                              {log.note || 'Tidak ada catatan'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', color: 'var(--color-muted-2)', textAlign: 'center' }}>
                        🏥 Belum ada catatan terapi untuk pasien ini.
                      </div>
                    )}
                  </div>
                )}

                {progressTab === 'vitals' && (
                  <div className="chart-card">
                    <h3>❤️ Vital Snapshots</h3>
                    {snapshotData.length > 0 ? (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {snapshotData.slice(0, 5).map((snapshot, idx) => (
                          <div key={snapshot.snapshot_id || idx} style={{
                            padding: '12px',
                            background: 'var(--color-bg)',
                            borderRadius: '8px',
                            borderLeft: '4px solid var(--teal)'
                          }}>
                            <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--color-text)', fontSize: '13px' }}>
                              {new Date(snapshot.snapshot_date || snapshot.created_at).toLocaleDateString()}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px' }}>
                              {snapshot.notes && (
                                <p style={{ margin: 0, color: 'var(--color-muted-2)', fontSize: '12px' }}>
                                  📝 {snapshot.notes}
                                </p>
                              )}
                              {snapshot.blood_pressure && (
                                <p style={{ margin: 0, color: 'var(--color-muted-2)', fontSize: '12px' }}>
                                  🩸 BP: {snapshot.blood_pressure}
                                </p>
                              )}
                              {snapshot.mobility_score && (
                                <p style={{ margin: 0, color: 'var(--color-muted-2)', fontSize: '12px' }}>
                                  🏃 Mobility: {snapshot.mobility_score}%
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', color: 'var(--color-muted-2)', textAlign: 'center' }}>
                        ❤️ Belum ada vital snapshot. Tambahkan melalui Vital Signs Tracker.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
