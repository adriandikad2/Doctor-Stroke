import React, { useState, useEffect } from 'react';

const MOCK_DATA = {
  medications: [
    { medication_id: 1, name: 'Aspirin', dosage: '81mg', frequency: 'Daily', lastTaken: '2 hours ago' },
    { medication_id: 2, name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', lastTaken: '4 hours ago' },
    { medication_id: 3, name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', lastTaken: '6 hours ago' }
  ],
  appointments: [
    { appointment_id: 1, title: 'Physical Therapy', time: '2:00 PM', location: 'Room 302' },
    { appointment_id: 2, title: 'Doctor Check-up', time: '4:30 PM', location: 'Clinic A' },
    { appointment_id: 3, title: 'Nutrition Consultation', time: 'Tomorrow 10:00 AM', location: 'Room 105' }
  ],
  recovery: {
    overallRecovery: 68,
    mobilityImprovement: 75,
    medicationAdherence: 92,
    therapyCompletion: 85
  },
  activities: [
    { id: 1, activity: 'Completed therapy session', time: '2 hours ago', icon: '✓' },
    { id: 2, activity: 'Logged 3 meals', time: '1 hour ago', icon: '🍽' },
    { id: 3, activity: 'Took morning medications', time: '4 hours ago', icon: '💊' },
    { id: 4, activity: 'Recorded blood pressure', time: '6 hours ago', icon: '📊' }
  ]
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    setDashboardData({
      user: userData,
      activeMedications: MOCK_DATA.medications,
      upcomingEvents: MOCK_DATA.appointments,
      recoveryProgress: MOCK_DATA.recovery,
      recentActivities: MOCK_DATA.activities
    });
    
    setLoading(false);
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

  if (!dashboardData) {
    return <div className="dashboard error">Failed to load dashboard data</div>;
  }

  const userName = dashboardData.user?.name || 'User';
  const medications = dashboardData.activeMedications || [];
  const events = dashboardData.upcomingEvents || [];
  const recovery = dashboardData.recoveryProgress || {};
  const activities = dashboardData.recentActivities || [];

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
        <h2>👋 Welcome back, {userName}!</h2>
        <p>Here's your health management overview for today</p>
      </div>

      <div className="dashboard-grid">
        {/* Active Medications Card */}
        <div className="card">
          <h3><span className="card-icon">💊</span>Active Medications</h3>
          {medications.length > 0 ? (
            medications.slice(0, 3).map((med) => (
              <div key={med.medication_id} className="medication-item">
                <p className="med-name">{med.name}</p>
                <p className="med-details">{med.dosage} • {med.frequency}</p>
                <p className="med-last">✓ {med.lastTaken}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--color-muted-2)', margin: 0 }}>No active medications</p>
          )}
        </div>

        {/* Upcoming Events Card */}
        <div className="card">
          <h3><span className="card-icon">📅</span>Upcoming Events</h3>
          {events.length > 0 ? (
            events.slice(0, 3).map((event) => (
              <div key={event.appointment_id} className="event-item">
                <p className="event-title">{event.title}</p>
                <p className="event-time">⏰ {event.time}</p>
                <p className="event-location">📍 {event.location}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--color-muted-2)', margin: 0 }}>No upcoming events</p>
          )}
        </div>

        {/* Quick Stats Card */}
        <div className="card">
          <h3><span className="card-icon">📊</span>Quick Stats</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Today's Steps</span>
                <span style={{ fontSize: '12px', color: 'var(--green)' }}>5,240</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Water Intake</span>
                <span style={{ fontSize: '12px', color: 'var(--blue)' }}>1.8L / 2L</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Progress Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '16px', fontWeight: 700 }}>
          🎯 Your Recovery Progress
        </h2>
        <div className="progress-container">
          <div className="progress-card">
            <p className="progress-title">Overall Recovery</p>
            <p className="progress-value">{recovery.overallRecovery || 68}%</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${recovery.overallRecovery || 68}%` }}
              ></div>
            </div>
            <p className="progress-label">Excellent progress!</p>
          </div>

          <div className="progress-card">
            <p className="progress-title">Mobility Improvement</p>
            <p className="progress-value">{recovery.mobilityImprovement || 75}%</p>
            <div className="progress-bar green">
              <div 
                className="progress-fill" 
                style={{ width: `${recovery.mobilityImprovement || 75}%` }}
              ></div>
            </div>
            <p className="progress-label">Keep up the exercises!</p>
          </div>

          <div className="progress-card">
            <p className="progress-title">Medication Adherence</p>
            <p className="progress-value">{recovery.medicationAdherence || 92}%</p>
            <div className="progress-bar lavender">
              <div 
                className="progress-fill" 
                style={{ width: `${recovery.medicationAdherence || 92}%` }}
              ></div>
            </div>
            <p className="progress-label">Excellent adherence!</p>
          </div>

          <div className="progress-card">
            <p className="progress-title">Therapy Completion</p>
            <p className="progress-value">{recovery.therapyCompletion || 85}%</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${recovery.therapyCompletion || 85}%` }}
              ></div>
            </div>
            <p className="progress-label">Nearly there!</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="activities-container">
        <h3>📝 Recent Activities</h3>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <p className="activity-text">{activity.activity}</p>
                <p className="activity-time">{activity.time}</p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--color-muted-2)' }}>No recent activities</p>
        )}
      </div>
    </div>
  );
}
