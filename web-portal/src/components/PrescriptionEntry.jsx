import React, { useState, useEffect } from 'react';
import { prescriptionAPI, logAPI } from '../utils/api';

export default function PrescriptionEntry({ patientId, onSuccess, user }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [warningMessage, setWarningMessage] = useState('');

  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    instructions: '',
    frequency_per_day: '1',
    dosing_times: ['08:00'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    if (patientId) {
      fetchPrescriptions();
    }
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionAPI.getByPatientId(patientId);
      if (response.success && response.data) {
        setPrescriptions(response.data);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setWarningMessage('');
  };

  const handleDosingTimeChange = (index, time) => {
    const newTimes = [...formData.dosing_times];
    newTimes[index] = time;
    setFormData(prev => ({
      ...prev,
      dosing_times: newTimes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setWarningMessage('');

    if (!formData.medication_name.trim()) {
      setError('Medication name is required');
      return;
    }

    if (!formData.dosage.trim()) {
      setError('Dosage is required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        patient_id: patientId,
        medication_name: formData.medication_name,
        dosage: formData.dosage,
        instructions: formData.instructions,
        frequency_per_day: parseInt(formData.frequency_per_day, 10),
        dosing_times: formData.dosing_times,
        start_date: `${formData.start_date}T00:00:00Z`,
        end_date: formData.end_date ? `${formData.end_date}T00:00:00Z` : null,
      };

      const response = await prescriptionAPI.create(payload);

      if (response.success) {
        setSuccess('✓ Prescription added successfully!');
        setFormData({
          medication_name: '',
          dosage: '',
          instructions: '',
          frequency_per_day: '1',
          dosing_times: ['08:00'],
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
        });
        setTimeout(() => {
          setShowForm(false);
          setSuccess('');
          fetchPrescriptions();
          onSuccess?.();
        }, 1500);
      } else {
        // Check if it's an interaction warning
        if (response.message?.includes('BAHAYA') || response.message?.includes('Interaksi')) {
          setWarningMessage(response.message);
          setError('Drug interaction detected. Please review and consult with patient.');
        } else {
          setError(response.message || 'Failed to add prescription');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      if (err.message?.includes('BAHAYA') || err.message?.includes('Interaksi')) {
        setWarningMessage(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <style>{`
        .prescription-section {
          background: var(--color-card);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid var(--color-border);
        }

        .prescription-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .prescription-header h3 {
          margin: 0;
          font-size: 16px;
          color: var(--primary);
          font-weight: 700;
        }

        .btn-add-prescription {
          padding: 8px 16px;
          background: var(--blue);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add-prescription:hover {
          background: #5A8FB8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(104, 161, 209, 0.3);
        }

        .prescription-form {
          background: var(--color-bg);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .form-row.full {
          grid-template-columns: 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: var(--color-card);
          color: var(--color-text);
          font-size: 13px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(104, 161, 209, 0.1);
        }

        .dosing-times {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .dosing-time-input {
          flex: 1;
          min-width: 100px;
        }

        .dosing-time-input input {
          width: 100%;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .btn-submit {
          padding: 10px 16px;
          background: var(--green);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-submit:hover {
          background: #92B999;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(164, 206, 169, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-cancel {
          padding: 10px 16px;
          background: #E8E8E8;
          color: #333;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: #D8D8D8;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 13px;
          border-left: 4px solid;
        }

        .alert-error {
          background: #FEE2E2;
          color: #DC2626;
          border-left-color: #DC2626;
        }

        .alert-warning {
          background: #FEF3C7;
          color: #D97706;
          border-left-color: #D97706;
        }

        .alert-success {
          background: #DBEAFE;
          color: #0369A1;
          border-left-color: #0369A1;
        }

        .prescription-list {
          margin-top: 16px;
        }

        .prescription-item {
          padding: 12px;
          background: var(--color-bg);
          border-radius: 6px;
          border-left: 4px solid var(--blue);
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }

        .prescription-item:hover {
          box-shadow: 0 4px 12px rgba(104, 161, 209, 0.15);
          transform: translateX(4px);
        }

        .prescription-name {
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 4px 0;
          font-size: 13px;
        }

        .prescription-details {
          font-size: 12px;
          color: var(--color-muted-2);
          margin: 0;
        }

        .prescription-status {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(164, 206, 169, 0.2);
          color: var(--green);
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="prescription-section">
        <div className="prescription-header">
          <h3>💊 Prescription Management</h3>
          {!showForm && (
            <button 
              className="btn-add-prescription"
              onClick={() => setShowForm(true)}
            >
              ➕ Add Prescription
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">❌ {error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}
        {warningMessage && <div className="alert alert-warning">⚠️ {warningMessage}</div>}

        {showForm && (
          <div className="prescription-form">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>New Prescription</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Medication Name *</label>
                  <input
                    type="text"
                    name="medication_name"
                    value={formData.medication_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Aspirin, Lisinopril"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Dosage *</label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    placeholder="e.g., 500mg, 10ml"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frequency (times per day)</label>
                  <select
                    name="frequency_per_day"
                    value={formData.frequency_per_day}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <option key={i} value={i}>{i} time(s)</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Instructions</label>
                  <input
                    type="text"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    placeholder="e.g., Take with food"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dosing Times</label>
                <div className="dosing-times">
                  {formData.dosing_times.map((time, idx) => (
                    <div key={idx} className="dosing-time-input">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleDosingTimeChange(idx, e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>End Date (Optional)</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : '💾 Add Prescription'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Current Prescriptions List */}
        {prescriptions.length > 0 && (
          <div className="prescription-list">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--color-muted)' }}>
              Active Prescriptions ({prescriptions.length})
            </h4>
            {prescriptions.filter(p => p.is_active).map((rx, idx) => (
              <div key={rx.prescription_id || idx} className="prescription-item">
                <p className="prescription-name">{rx.medication_name}</p>
                <p className="prescription-details">
                  💊 {rx.dosage} • {rx.frequency_per_day}x daily • {rx.instructions || 'No special instructions'}
                </p>
                <p className="prescription-details">
                  📅 {new Date(rx.start_date).toLocaleDateString()} - {rx.end_date ? new Date(rx.end_date).toLocaleDateString() : 'Ongoing'}
                </p>
                <span className="prescription-status">✓ Active</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
