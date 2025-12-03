import React, { useState, useEffect } from 'react';
import { patientAPI, logAPI } from './utils/api';

const COLORS = {
  primary: '#8385CC',
  blue: '#68A1D1',
  teal: '#79AEB3',
  green: '#A4CEA9',
  lavender: '#B199C7',
  soft: '#E0BEE6'
};

// Mock recovery timeline data
const MOCK_RECOVERY_TIMELINE = [
  { phase: 'Acute Phase', duration: 'Week 1-2', status: 'completed', progress: 100 },
  { phase: 'Early Recovery', duration: 'Week 3-6', status: 'completed', progress: 100 },
  { phase: 'Active Rehabilitation', duration: 'Week 7-12', status: 'in-progress', progress: 65 },
  { phase: 'Community Integration', duration: 'Week 13+', status: 'not-started', progress: 0 }
];

function BarChart({ data, dataKey, maxValue = 100, color = COLORS.blue }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: '200px',
      gap: '8px',
      padding: '16px 0'
    }}>
      {data.map((item, idx) => {
        const percentage = (item[dataKey] / maxValue) * 100;
        return (
          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '100%',
              height: `${percentage}%`,
              backgroundColor: color,
              borderRadius: '8px 8px 0 0',
              minHeight: '20px',
              boxShadow: `0 4px 12px ${color}40`,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }} 
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 6px 16px ${color}60`}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-muted-2)', fontWeight: 600 }}>
              {item[dataKey]}%
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-muted-2)' }}>
              {item.month || item.week || item.date}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data, maxValue = 150 }) {
  const points = data.map((item, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 100 - ((item.bp_systolic - 100) / (maxValue - 100)) * 100;
    return { x, y, ...item };
  });

  const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div style={{ width: '100%', height: '200px', position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ position: 'relative' }}>
        {/* Grid */}
        <g stroke="var(--color-border)" strokeWidth="0.5" opacity="0.5">
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} />
          ))}
          {[0, 25, 50, 75, 100].map((x) => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="100" />
          ))}
        </g>

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={COLORS.blue}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="1.5" fill={COLORS.blue} opacity="0.8" />
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px', fontSize: '11px' }}>
        {data.map((item, idx) => (
          <span key={idx} style={{ color: 'var(--color-muted-2)' }}>
            {item.date}: {item.bp_systolic}/{item.bp_diastolic}
          </span>
        ))}
      </div>
    </div>
  );
}

function RecoveryTimeline() {
  return (
    <div style={{ padding: '0 16px' }}>
      {MOCK_RECOVERY_TIMELINE.map((phase, idx) => {
        const isCompleted = phase.status === 'completed';
        const isInProgress = phase.status === 'in-progress';
        const color = isCompleted ? COLORS.green : isInProgress ? COLORS.blue : 'var(--color-border)';

        return (
          <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: idx !== MOCK_RECOVERY_TIMELINE.length - 1 ? '24px' : '0' }}>
            {/* Timeline dot dan line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: color,
                border: `3px solid ${isInProgress ? 'var(--color-card)' : 'transparent'}`,
                boxShadow: isInProgress ? `0 0 0 3px ${color}40` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                animation: isInProgress ? 'pulse 2s infinite' : 'none'
              }}>
                {isCompleted ? '✓' : isInProgress ? '' : idx + 1}
              </div>
              {idx !== MOCK_RECOVERY_TIMELINE.length - 1 && (
                <div style={{
                  width: '3px',
                  height: '24px',
                  backgroundColor: color,
                  marginTop: '-4px'
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingTop: '4px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: color, fontWeight: 700 }}>
                {phase.phase}
              </h4>
              <p style={{ margin: '0 0 8px 0', color: 'var(--color-muted-2)', fontSize: '13px' }}>
                {phase.duration}
              </p>
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${phase.progress}%`,
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: '3px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default function Progress() {
  const [activeTab, setActiveTab] = useState('adherence');
  const [animateCharts, setAnimateCharts] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [adherenceData, setAdherenceData] = useState([]);
  const [progressLogs, setProgressLogs] = useState([]);
  const [snapshotData, setSnapshotData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAnimateCharts(true);
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getMyPatients();
      if (response.success) {
        const patientsList = Array.isArray(response.data) ? response.data : [];
        setPatients(patientsList);
        if (patientsList.length > 0) {
          setSelectedPatient(patientsList[0]);
        }
      } else {
        setError(response.message || 'Failed to fetch patients');
        setPatients([]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'An error occurred while loading patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchProgressData();
    }
  }, [selectedPatient]);

  const fetchProgressData = async () => {
    if (!selectedPatient?.patient_id) return;

    try {
      setLoading(true);
      setError('');

      // Fetch adherence logs (for medication adherence chart)
      try {
        const adherenceResponse = await logAPI.adherence.getByPatientId(selectedPatient.patient_id);
        if (adherenceResponse.success && adherenceResponse.data) {
          const grouped = groupAdherenceByMonth(adherenceResponse.data);
          setAdherenceData(grouped);
        } else {
          setAdherenceData([]);
        }
      } catch (err) {
        console.error('Error fetching adherence data:', err);
        setAdherenceData([]);
      }

      // Fetch progress logs
      try {
        const progressResponse = await logAPI.progress.getByPatientId(selectedPatient.patient_id);
        if (progressResponse.success && progressResponse.data) {
          setProgressLogs(progressResponse.data);
        } else {
          setProgressLogs([]);
        }
      } catch (err) {
        console.error('Error fetching progress logs:', err);
        setProgressLogs([]);
      }

      // Fetch progress snapshots
      try {
        const snapshotResponse = await logAPI.snapshot.getByPatientId(selectedPatient.patient_id);
        if (snapshotResponse.success && snapshotResponse.data) {
          setSnapshotData(snapshotResponse.data);
        } else {
          setSnapshotData([]);
        }
      } catch (err) {
        console.error('Error fetching snapshot data:', err);
        setSnapshotData([]);
      }
    } catch (err) {
      console.error('Progress data error:', err);
      setError(err.message || 'Failed to fetch progress data');
    } finally {
      setLoading(false);
    }
  };

  // Group adherence logs by month
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

    // Convert to rate percentage
    return Object.values(months)
      .slice(0, 6)
      .map(m => ({
        ...m,
        rate: m.total > 0 ? Math.round((m.taken / m.total) * 100) : 0
      }));
  };

  // Calculate current adherence rate
  const getCurrentAdherenceRate = () => {
    if (adherenceData.length === 0) return 0;
    const lastMonth = adherenceData[adherenceData.length - 1];
    return lastMonth.rate || 0;
  };

  // Calculate average adherence rate
  const getAverageAdherenceRate = () => {
    if (adherenceData.length === 0) return 0;
    const sum = adherenceData.reduce((acc, item) => acc + (item.rate || 0), 0);
    return Math.round(sum / adherenceData.length);
  };

  const tabs = [
    { id: 'adherence', label: 'Medication Adherence', icon: '💊' },
    { id: 'therapy', label: 'Therapy Sessions', icon: '🏥' },
    { id: 'vitals', label: 'Vital Signs', icon: '❤️' },
    { id: 'timeline', label: 'Recovery Timeline', icon: '📋' }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

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

        .progress-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .progress-header {
          margin-bottom: 32px;
          animation: slideInUp 0.6s ease-out;
        }

        .progress-header h2 {
          font-size: 28px;
          color: var(--primary);
          margin: 0 0 8px 0;
          font-weight: 700;
        }

        .progress-header p {
          color: var(--color-muted);
          margin: 0;
          font-size: 14px;
        }

        .tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 2px solid var(--color-border);
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .tab-button {
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: var(--color-muted);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab-button:hover {
          color: var(--primary);
        }

        .tab-button.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .chart-card {
          background: var(--color-card);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 12px 30px rgba(14, 30, 45, 0.06);
          border: 1px solid var(--color-border);
          margin-bottom: 20px;
          animation: slideInUp 0.6s ease-out;
        }

        .chart-card h3 {
          margin: 0 0 20px 0;
          font-size: 16px;
          color: var(--primary);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .stat-item {
          background: var(--color-bg);
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid var(--primary);
          text-align: center;
        }

        .stat-label {
          font-size: 12px;
          color: var(--color-muted-2);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          color: var(--primary);
          font-weight: 700;
          margin: 0;
        }

        .stat-description {
          font-size: 12px;
          color: var(--color-muted);
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .progress-container {
            padding: 12px;
          }

          .progress-header h2 {
            font-size: 24px;
          }

          .chart-card {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="progress-container">
        <div className="progress-header">
          <h2>📊 Patient Progress & Recovery</h2>
          <p>Comprehensive overview of patient recovery and treatment adherence</p>
        </div>

        {/* Info Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(131, 133, 204, 0.1) 0%, rgba(121, 174, 179, 0.1) 100%)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid var(--color-border)',
          borderLeft: '4px solid var(--primary)'
        }}>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: 'var(--color-text)',
            lineHeight: '1.6'
          }}>
            <strong>💡 Tip:</strong> This dashboard displays real-time data from your patient's clinical activities. 
            To populate the charts below, ensure you're logging vitals, recording therapy sessions, and tracking medication adherence in the <strong>Dashboard</strong>.
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2',
            color: '#DC2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            borderLeft: '4px solid #DC2626'
          }}>
            ❌ Error: {error}
          </div>
        )}

        {/* Patient Selector */}
        <div style={{
          background: 'var(--color-card)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 12px 30px rgba(14, 30, 45, 0.06)',
          border: '1px solid var(--color-border)'
        }}>
          <label style={{
            display: 'block',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '8px',
            fontSize: '14px'
          }}>🏥 Select Patient</label>
          <select 
            value={selectedPatient?.patient_id || ''} 
            onChange={(e) => {
              const patient = patients.find(p => p.patient_id === e.target.value);
              setSelectedPatient(patient || null);
            }}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '13px'
            }}
          >
            <option value="">-- Select Patient --</option>
            {patients.map(p => (
              <option key={p.patient_id} value={p.patient_id}>{p.name}</option>
            ))}
          </select>
        </div>

        {!selectedPatient && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--color-muted-2)'
          }}>
            <p style={{ fontSize: '14px' }}>👉 Please select a patient to view progress data.</p>
          </div>
        )}

        {selectedPatient && !loading && (
          <>
          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

        {/* Content */}
        {activeTab === 'adherence' && (
          <>
            <div className="chart-card">
              <h3>💊 Medication Adherence Rate</h3>
              {adherenceData.length > 0 ? (
                <>
                  <BarChart data={adherenceData} dataKey="rate" maxValue={100} color={COLORS.primary} />
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-label">Current Rate</div>
                      <p className="stat-value">{getCurrentAdherenceRate()}%</p>
                      <div className="stat-description">Latest month</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Average Rate</div>
                      <p className="stat-value">{getAverageAdherenceRate()}%</p>
                      <div className="stat-description">Overall performance</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Total Doses</div>
                      <p className="stat-value">{adherenceData.reduce((acc, m) => acc + m.total, 0)}</p>
                      <div className="stat-description">Tracked doses</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-2)', background: 'var(--color-bg)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>📊 No adherence data available yet</p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', lineHeight: '1.6' }}>
                    To see adherence graphs here, add medication logs to the patient via the <strong>Medication Management</strong> or <strong>Prescription</strong> sections in Dashboard.
                  </p>
                  <div style={{ 
                    background: 'var(--color-card)',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    marginTop: '12px',
                    borderLeft: '3px solid var(--blue)',
                    textAlign: 'left'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>💡 How to see sample data:</p>
                    <ol style={{ margin: '0', paddingLeft: '16px', lineHeight: '1.8' }}>
                      <li>Go to <strong>Dashboard</strong></li>
                      <li>Create prescriptions or medications for your patient</li>
                      <li>Track medication adherence logs over multiple days</li>
                      <li>Return here to see the adherence graph populate</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'therapy' && (
          <>
            <div className="chart-card">
              <h3>🏥 Progress Logs</h3>
              {progressLogs.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {progressLogs.map((log, idx) => (
                    <div key={log.progress_log_id || idx} style={{
                      padding: '12px',
                      marginBottom: '12px',
                      background: 'var(--color-bg)',
                      borderRadius: '8px',
                      borderLeft: '4px solid ' + COLORS.blue
                    }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--color-text)', fontSize: '13px' }}>
                        {new Date(log.logged_date || log.created_at).toLocaleDateString()}
                      </p>
                      <p style={{ margin: 0, color: 'var(--color-muted-2)', fontSize: '12px' }}>
                        {log.note || 'No details provided'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-2)', background: 'var(--color-bg)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>🏥 No therapy progress logs yet</p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', lineHeight: '1.6' }}>
                    Progress logs track your patient's therapy sessions and recovery milestones.
                  </p>
                  <div style={{ 
                    background: 'var(--color-card)',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    marginTop: '12px',
                    borderLeft: '3px solid var(--blue)',
                    textAlign: 'left'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>💡 How to add progress logs:</p>
                    <ol style={{ margin: '0', paddingLeft: '16px', lineHeight: '1.8' }}>
                      <li>Go to <strong>Dashboard</strong> and select your patient</li>
                      <li>Look for <strong>Progress Management</strong> or therapy section</li>
                      <li>Add a new progress note/log entry</li>
                      <li>Include session date, therapy type, and patient feedback</li>
                      <li>Save the entry</li>
                      <li>Progress entries will appear here automatically</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'vitals' && (
          <>
            <div className="chart-card">
              <h3>❤️ Progress Snapshots</h3>
              {snapshotData.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {snapshotData.slice(0, 5).map((snapshot, idx) => (
                    <div key={snapshot.snapshot_id || idx} style={{
                      padding: '16px',
                      background: 'var(--color-bg)',
                      borderRadius: '8px',
                      borderLeft: '4px solid ' + COLORS.teal
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--color-text)', fontSize: '13px' }}>
                        {new Date(snapshot.snapshot_date || snapshot.created_at).toLocaleDateString()}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
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
                            � Mobility: {snapshot.mobility_score}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-2)', background: 'var(--color-bg)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>❤️ No vital signs data yet</p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', lineHeight: '1.6' }}>
                    Vital signs snapshots are automatically recorded when you add data via the <strong>🩺 Vital Signs Tracker</strong> in the Dashboard.
                  </p>
                  <div style={{ 
                    background: 'var(--color-card)',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    marginTop: '12px',
                    borderLeft: '3px solid var(--teal)',
                    textAlign: 'left'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>💡 How to populate vital signs:</p>
                    <ol style={{ margin: '0', paddingLeft: '16px', lineHeight: '1.8' }}>
                      <li>Go to <strong>Dashboard</strong> and select your patient</li>
                      <li>Scroll to <strong>🩺 Vital Signs Tracker</strong></li>
                      <li>Click <strong>➕ Record Vitals</strong></li>
                      <li>Enter blood pressure readings (e.g., 120/80 mmHg)</li>
                      <li>Optionally check "Exercise completed" and add notes</li>
                      <li>Click <strong>💾 Save</strong></li>
                      <li>Record data over several days to see graphs here</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'timeline' && (
          <>
            <div className="chart-card">
              <h3>📋 Patient Clinical Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="stat-item">
                  <div className="stat-label">Patient Name</div>
                  <p className="stat-value" style={{ fontSize: '18px' }}>{selectedPatient?.name}</p>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Unique Code</div>
                  <p className="stat-value" style={{ fontSize: '16px' }}>{selectedPatient?.unique_code}</p>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Logs</div>
                  <p className="stat-value">{progressLogs.length}</p>
                  <div className="stat-description">Progress entries</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Adherence</div>
                  <p className="stat-value">{getCurrentAdherenceRate()}%</p>
                  <div className="stat-description">Current rate</div>
                </div>
              </div>
            </div>
          </>
        )}
        </>
        )}
      </div>
    </div>
  );
}
