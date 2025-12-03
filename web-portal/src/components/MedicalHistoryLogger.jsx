import React, { useState, useEffect } from 'react';
import { logAPI } from '../utils/api';

/**
 * Simplified MedicalHistoryLogger Component
 * Only tracks Blood Pressure, Notes, and Exercise
 */
export default function MedicalHistoryLogger({ patientId, onSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logs, setLogs] = useState([]);

  const [formData, setFormData] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    exercise_completed: false,
    notes: '',
  });

  useEffect(() => {
    if (patientId) fetchLogs();
  }, [patientId]);

  const fetchLogs = async () => {
    try {
      const response = await logAPI.snapshot.getByPatientId(patientId);
      if (response.success && response.data) setLogs(response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.blood_pressure_systolic || !formData.blood_pressure_diastolic) {
      setError('Blood pressure values required');
      return;
    }
    
    setLoading(true);
    try {
      const response = await logAPI.snapshot.create({
        patient_id: patientId,
        recorded_at: new Date().toISOString(),
        blood_pressure_systolic: parseInt(formData.blood_pressure_systolic),
        blood_pressure_diastolic: parseInt(formData.blood_pressure_diastolic),
        exercise_completed: formData.exercise_completed,
        notes: formData.notes || null,
        mood: null, symptom_score: null, mobility_score: null,
      });

      if (response.success) {
        setSuccess('✓ Vitals recorded!');
        setFormData({ blood_pressure_systolic: '', blood_pressure_diastolic: '', exercise_completed: false, notes: '' });
        setTimeout(() => { setShowForm(false); setSuccess(''); fetchLogs(); onSuccess?.(); }, 1500);
      } else setError(response.message || 'Failed');
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <style>{`
        .vital-section { background: var(--color-card); border-radius: 12px; padding: 20px; border: 1px solid var(--color-border); }
        .vital-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .vital-header h3 { margin: 0; font-size: 16px; color: var(--primary); font-weight: 700; }
        .btn-vital { padding: 8px 16px; background: var(--teal); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .btn-vital:hover { background: #5f8b8f; transform: translateY(-2px); }
        .vital-form { background: var(--color-bg); padding: 16px; border-radius: 8px; border: 1px solid var(--color-border); margin-bottom: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .form-row.full { grid-template-columns: 1fr; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { font-size: 12px; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; }
        .form-group input, .form-group textarea { padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 13px; }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--teal); }
        .form-group textarea { resize: vertical; min-height: 60px; }
        .checkbox-group { display: flex; align-items: center; gap: 8px; padding: 10px; background: var(--color-card); border-radius: 6px; cursor: pointer; }
        .checkbox-group input { cursor: pointer; accent-color: var(--teal); }
        .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
        .btn-submit, .btn-cancel { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-submit { background: var(--teal); color: white; }
        .btn-submit:hover { background: #5f8b8f; transform: translateY(-2px); }
        .btn-cancel { background: #E8E8E8; color: #333; }
        .alert { padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; border-left: 4px solid; }
        .alert-error { background: #FEE2E2; color: #DC2626; border-left-color: #DC2626; }
        .alert-success { background: #DBEAFE; color: #0369A1; border-left-color: #0369A1; }
        .log-item { padding: 12px; background: var(--color-bg); border-radius: 6px; border-left: 4px solid var(--teal); margin-bottom: 8px; }
        .log-date { font-weight: 700; color: var(--color-text); margin: 0 0 4px 0; font-size: 13px; }
        .log-details { font-size: 12px; color: var(--color-muted-2); margin: 0; }
      `}</style>

      <div className="vital-section">
        <div className="vital-header">
          <h3>🩺 Vital Signs Tracker</h3>
          {!showForm && <button className="btn-vital" onClick={() => setShowForm(true)}>➕ Record Vitals</button>}
        </div>

        {error && <div className="alert alert-error">❌ {error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        {showForm && (
          <div className="vital-form">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Systolic (mmHg) *</label>
                  <input type="number" name="blood_pressure_systolic" value={formData.blood_pressure_systolic} onChange={handleInputChange} placeholder="120" min="70" max="200" required disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Diastolic (mmHg) *</label>
                  <input type="number" name="blood_pressure_diastolic" value={formData.blood_pressure_diastolic} onChange={handleInputChange} placeholder="80" min="40" max="130" required disabled={loading} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Exercise</label>
                  <div className="checkbox-group">
                    <input type="checkbox" name="exercise_completed" checked={formData.exercise_completed} onChange={handleInputChange} disabled={loading} id="ex" />
                    <label htmlFor="ex">✓ Completed today</label>
                  </div>
                </div>
              </div>

              <div className="form-row full">
                <div className="form-group">
                  <label>Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Observations..." disabled={loading} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)} disabled={loading}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Saving...' : '💾 Save'}</button>
              </div>
            </form>
          </div>
        )}

        {logs.filter(l => l.blood_pressure_systolic).length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--color-muted)' }}>Recent ({logs.filter(l => l.blood_pressure_systolic).length})</h4>
            {logs.filter(l => l.blood_pressure_systolic).slice(0, 5).map((log, idx) => (
              <div key={log.entry_id || idx} className="log-item">
                <p className="log-date">{new Date(log.recorded_at || log.created_at).toLocaleDateString()}</p>
                <p className="log-details">🩸 <strong>BP: {log.blood_pressure_systolic}/{log.blood_pressure_diastolic}</strong></p>
                {log.exercise_completed && <p className="log-details">✓ Exercised</p>}
                {log.notes && <p className="log-details">📝 {log.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
