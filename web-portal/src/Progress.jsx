import React, { useState, useEffect } from 'react';

const COLORS = {
  primary: '#8385CC',
  blue: '#68A1D1',
  teal: '#79AEB3',
  green: '#A4CEA9',
  lavender: '#B199C7',
  soft: '#E0BEE6'
};

// Mock data untuk grafik
const MOCK_ADHERENCE_DATA = [
  { month: 'Jan', rate: 78 },
  { month: 'Feb', rate: 82 },
  { month: 'Mar', rate: 85 },
  { month: 'Apr', rate: 88 },
  { month: 'May', rate: 92 },
  { month: 'Jun', rate: 95 }
];

const MOCK_THERAPY_DATA = [
  { week: 'Week 1', completed: 4, total: 4 },
  { week: 'Week 2', completed: 3, total: 4 },
  { week: 'Week 3', completed: 4, total: 4 },
  { week: 'Week 4', completed: 3, total: 4 }
];

const MOCK_RECOVERY_TIMELINE = [
  { phase: 'Phase 1', duration: 'Week 1-2', status: 'completed', progress: 100 },
  { phase: 'Phase 2', duration: 'Week 3-4', status: 'completed', progress: 100 },
  { phase: 'Phase 3', duration: 'Week 5-8', status: 'in-progress', progress: 65 },
  { phase: 'Phase 4', duration: 'Week 9+', status: 'pending', progress: 0 }
];

const MOCK_VITAL_SIGNS = [
  { date: 'Day 1', bp_systolic: 145, bp_diastolic: 92 },
  { date: 'Day 5', bp_systolic: 142, bp_diastolic: 88 },
  { date: 'Day 10', bp_systolic: 138, bp_diastolic: 85 },
  { date: 'Day 15', bp_systolic: 135, bp_diastolic: 82 },
  { date: 'Day 20', bp_systolic: 132, bp_diastolic: 80 }
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

  useEffect(() => {
    setAnimateCharts(true);
  }, []);

  const tabs = [
    { id: 'adherence', label: '💊 Medication Adherence', icon: '💊' },
    { id: 'therapy', label: '🏥 Therapy Sessions', icon: '🏥' },
    { id: 'vitals', label: '❤️ Vital Signs', icon: '❤️' },
    { id: 'timeline', label: '📋 Recovery Timeline', icon: '📋' }
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
          <h2>📊 Your Progress</h2>
          <p>Comprehensive overview of your recovery and treatment adherence</p>
        </div>

        {/* Tabs */}
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
              <h3>💊 Medication Adherence Rate (Last 6 Months)</h3>
              <BarChart data={MOCK_ADHERENCE_DATA} dataKey="rate" maxValue={100} color={COLORS.primary} />
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Current Rate</div>
                  <p className="stat-value">95%</p>
                  <div className="stat-description">⬆ +3% from last month</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Average Rate</div>
                  <p className="stat-value">87%</p>
                  <div className="stat-description">Excellent performance</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Trending</div>
                  <p className="stat-value">📈</p>
                  <div className="stat-description">Steady improvement</div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>📋 Missed Doses Alert</h3>
              <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ margin: 0, color: 'var(--green)', fontWeight: 600 }}>✓ No missed doses this week</p>
                <p style={{ margin: '8px 0 0 0', color: 'var(--color-muted-2)', fontSize: '13px' }}>
                  Keep up the excellent work! Your consistency helps with your recovery.
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'therapy' && (
          <>
            <div className="chart-card">
              <h3>🏥 Therapy Sessions Completed (Last 4 Weeks)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {MOCK_THERAPY_DATA.map((week, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '4px',
                      marginBottom: '12px'
                    }}>
                      {[...Array(week.total)].map((_, i) => (
                        <div key={i} style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: i < week.completed ? COLORS.green : 'var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>
                          {i < week.completed ? '✓' : ''}
                        </div>
                      ))}
                    </div>
                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '14px', fontWeight: 600 }}>
                      {week.week}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--color-muted-2)', fontSize: '12px' }}>
                      {week.completed}/{week.total} completed
                    </p>
                  </div>
                ))}
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Completion Rate</div>
                  <p className="stat-value">94%</p>
                  <div className="stat-description">Strong adherence</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Sessions</div>
                  <p className="stat-value">15</p>
                  <div className="stat-description">Out of 16 scheduled</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Streak</div>
                  <p className="stat-value">8 🔥</p>
                  <div className="stat-description">Days in a row</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'vitals' && (
          <>
            <div className="chart-card">
              <h3>❤️ Blood Pressure Trend (Systolic)</h3>
              <LineChart data={MOCK_VITAL_SIGNS} maxValue={150} />
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Current BP</div>
                  <p className="stat-value">132/80</p>
                  <div className="stat-description">Normal range</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Improvement</div>
                  <p className="stat-value">-13 mmHg</p>
                  <div className="stat-description">In 20 days</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Status</div>
                  <p className="stat-value">✓</p>
                  <div className="stat-description">Controlled</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'timeline' && (
          <>
            <div className="chart-card">
              <h3>📋 Recovery Timeline & Milestones</h3>
              <RecoveryTimeline />
            </div>

            <div className="chart-card">
              <h3>🎯 Upcoming Milestones</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{
                  padding: '16px',
                  background: 'var(--color-bg)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${COLORS.blue}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }} 
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(104, 161, 209, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <h4 style={{ margin: '0 0 4px 0', color: COLORS.blue, fontSize: '14px', fontWeight: 600 }}>
                    Week 5 Milestone
                  </h4>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--color-muted-2)', fontSize: '13px' }}>
                    Begin advanced mobility exercises
                  </p>
                  <div style={{ width: '100%', height: '4px', background: 'var(--color-border)', borderRadius: '2px' }}>
                    <div style={{ width: '60%', height: '100%', background: COLORS.blue, borderRadius: '2px' }} />
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: 'var(--color-bg)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${COLORS.teal}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(121, 174, 179, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <h4 style={{ margin: '0 0 4px 0', color: COLORS.teal, fontSize: '14px', fontWeight: 600 }}>
                    Week 8 Milestone
                  </h4>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--color-muted-2)', fontSize: '13px' }}>
                    Return to light physical activities
                  </p>
                  <div style={{ width: '100%', height: '4px', background: 'var(--color-border)', borderRadius: '2px' }}>
                    <div style={{ width: '0%', height: '100%', background: COLORS.teal, borderRadius: '2px' }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
