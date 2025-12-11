import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SignIn from './SignIn';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [showSignIn, setShowSignIn] = React.useState(false);
  const [insight, setInsight] = React.useState('');
  const [patients, setPatients] = React.useState([]);
  const [selectedPatientId, setSelectedPatientId] = React.useState('');
  const { authToken } = useAuth();

  const handleSignInClose = () => {
    setShowSignIn(false);
  };

  const handleSignInSuccess = () => {
    setShowSignIn(false);
    window.location.reload();
  };

  return isAuthenticated ? (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: '700',
        color: '#8385CC',
        marginBottom: '16px'
      }}>Welcome to Doctor Stroke Portal</h1>
      <p style={{
        fontSize: '16px',
        color: '#64748b',
        marginBottom: '24px'
      }}>
        Use the navigation menu above to access patient management tools, diet plans, medications, and progress tracking.
      </p>
      <div style={{ maxWidth: 900, margin: '0 auto', marginBottom: 24, textAlign: 'left' }}>
        <InsightPanel
          authToken={authToken}
          insight={insight}
          setInsight={setInsight}
          patients={patients}
          setPatients={setPatients}
          selectedPatientId={selectedPatientId}
          setSelectedPatientId={setSelectedPatientId}
        />
      </div>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{ color: '#8385CC', marginTop: 0 }}>Getting Started</h2>
        <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
          <li>📊 View all patients assigned to you</li>
          <li>🥗 Create and manage diet plans</li>
          <li>💊 Track medication adherence</li>
          <li>📈 Monitor patient progress</li>
          <li>📅 Schedule appointments</li>
        </ul>
      </div>
    </div>
  ) : (
    <>
      {!showSignIn ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)',
          padding: '20px',
          backgroundColor: '#f6fbff'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#8385CC',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              fontSize: '40px'
            }}>⚕️</div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#8385CC',
              marginBottom: '16px'
            }}>Doctor Stroke</h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Your Recovery, Your Time! Access your patient care tools, recovery tracking, and health management in one place.
            </p>
            <button
              onClick={() => setShowSignIn(true)}
              style={{
                padding: '12px 32px',
                backgroundColor: '#8385CC',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                boxShadow: '0 4px 12px rgba(131, 133, 204, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#6a6cc2'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#8385CC'}
            >
              Sign In or Create Account
            </button>
          </div>
        </div>
      ) : (
        <SignIn onClose={handleSignInClose} onSuccess={handleSignInSuccess} />
      )}
    </>
  );
};

export default Home;

function InsightPanel({ authToken, insight, setInsight, patients, setPatients, selectedPatientId, setSelectedPatientId }) {
  React.useEffect(() => {
    if (!authToken) return;
    const loadPatients = async () => {
      try {
        const res = await fetch('/api/patients/me', { headers: { Authorization: `Bearer ${authToken}` } });
        const data = await res.json();
        if (res.ok) {
          const list = data.data || [];
          setPatients(list);
          const pid = list[0]?.patient_id || '';
          setSelectedPatientId(pid);
          if (pid) fetchInsight(pid);
        }
      } catch {
        /* ignore */
      }
    };
    loadPatients();
  }, [authToken]);

  const fetchInsight = async (patientId) => {
    if (!patientId) {
      setInsight('');
      return;
    }
    try {
      const res = await fetch(`/api/insights/patient/${patientId}/summary`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) setInsight(data.data || '');
      else setInsight('');
    } catch {
      setInsight('');
    }
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>AI Insight (Gemini)</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Ringkasan kondisi terbaru pasien</div>
        </div>
        <select
          value={selectedPatientId}
          onChange={(e) => {
            setSelectedPatientId(e.target.value);
            fetchInsight(e.target.value);
          }}
          style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
        >
          <option value="">-- Select Patient --</option>
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ color: '#334155', fontSize: 14, lineHeight: 1.6 }}>
        {insight || 'Belum ada insight untuk pasien ini.'}
      </div>
    </div>
  );
}
