import React, { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI } from '../utils/api';

export default function AppointmentBooking({ user, onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user?.role === 'doctor' || user?.role === 'therapist') {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getMyPatients();
      if (response.success && response.data) {
        setPatients(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedPatient || !startTime || !endTime) {
      setError('Please fill in all required fields');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const response = await appointmentAPI.createSlot({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });

      if (response.success) {
        setSuccess('✓ Appointment scheduled successfully!');
        setSelectedPatient('');
        setStartTime('');
        setEndTime('');
        setNotes('');
        setAppointmentType('consultation');
        
        setTimeout(() => {
          setShowForm(false);
          setSuccess('');
          onSuccess?.();
        }, 1500);
      } else {
        setError(response.message || 'Failed to schedule appointment');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <style>{`
        .appointment-section {
          background: var(--color-card);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid var(--color-border);
        }

        .appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .appointment-header h3 {
          margin: 0;
          font-size: 16px;
          color: var(--primary);
          font-weight: 700;
        }

        .btn-new-appointment {
          padding: 8px 16px;
          background: var(--teal);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-new-appointment:hover {
          background: #6A9A9D;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(121, 174, 179, 0.3);
        }

        .appointment-form {
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
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(121, 174, 179, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .btn-submit {
          padding: 10px 16px;
          background: var(--teal);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-submit:hover {
          background: #6A9A9D;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(121, 174, 179, 0.3);
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

        .alert-success {
          background: #DBEAFE;
          color: #0369A1;
          border-left-color: #0369A1;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="appointment-section">
        <div className="appointment-header">
          <h3>📅 Schedule Appointment</h3>
          {!showForm && (
            <button 
              className="btn-new-appointment"
              onClick={() => setShowForm(true)}
            >
              ➕ New Appointment
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">❌ {error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        {showForm && (
          <div className="appointment-form">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Schedule New Appointment</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient *</label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    disabled={loading}
                    required
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Appointment Type</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="consultation">Consultation</option>
                    <option value="therapy">Therapy Session</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="checkup">Checkup</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-row full">
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={loading}
                    placeholder="Add any notes about this appointment..."
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
                  {loading ? 'Scheduling...' : '📅 Schedule'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
