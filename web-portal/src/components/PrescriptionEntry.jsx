import React, { useEffect, useState } from 'react';
import { prescriptionAPI, medicationCatalogAPI } from '../utils/api';

export default function PrescriptionEntry({ patientId, onSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  const [prescriptions, setPrescriptions] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [patientMeds, setPatientMeds] = useState([]);
  const [assigning, setAssigning] = useState('');

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
      fetchCatalog();
      fetchPatientMeds();
    }
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionAPI.getByPatientId(patientId);
      if (response.success && response.data) setPrescriptions(response.data);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await medicationCatalogAPI.getCatalog();
      if (res.success) setCatalog(res.data || []);
    } catch (err) {
      console.error('Error fetching catalog', err);
    }
  };

  const fetchPatientMeds = async () => {
    try {
      const res = await medicationCatalogAPI.getPatientMedications(patientId);
      if (res.success) setPatientMeds(res.data || []);
    } catch (err) {
      console.error('Error fetching patient meds', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setWarningMessage('');
  };

  const handleDosingTimeChange = (index, time) => {
    const next = [...formData.dosing_times];
    next[index] = time;
    setFormData((prev) => ({ ...prev, dosing_times: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setWarningMessage('');

    if (!formData.medication_name.trim() || !formData.dosage.trim()) {
      setError('Medication name and dosage are required');
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
        fetchPrescriptions();
        onSuccess?.();
      } else {
        if (response.message?.includes('BAHAYA') || response.message?.includes('Interaksi')) {
          setWarningMessage(response.message);
          setError('Drug interaction detected. Please review.');
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

  const handleAssignFromCatalog = async (catalogId) => {
    if (!patientId) return;
    setAssigning(catalogId);
    setError('');
    setSuccess('');
    try {
      const res = await medicationCatalogAPI.assignToPatient(catalogId, patientId);
      if (res.success) {
        setSuccess('Obat dari katalog berhasil ditambahkan ke pasien');
        fetchPatientMeds();
      } else {
        setError(res.message || 'Gagal menambahkan obat');
      }
    } catch (err) {
      setError(err.message || 'Gagal menambahkan obat');
    } finally {
      setAssigning('');
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
        .prescription-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .prescription-header h3 { margin:0; font-size:16px; color:var(--primary); font-weight:700; }
        .btn-add-prescription { padding:8px 16px; background: var(--blue); color:#fff; border:none; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; transition: all .3s ease; }
        .btn-add-prescription:hover { background:#5A8FB8; transform: translateY(-2px); box-shadow:0 4px 12px rgba(104,161,209,0.3); }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .form-row.full { grid-template-columns:1fr; }
        .form-group { display:flex; flex-direction:column; }
        .form-group label { font-size:12px; font-weight:600; color:var(--color-text); margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px; }
        .form-group input, .form-group select, .form-group textarea { padding:10px 12px; border:1px solid var(--color-border); border-radius:6px; background:var(--color-card); color:var(--color-text); font-size:13px; font-family:inherit; }
        .prescription-card { border:1px solid var(--color-border); border-radius:10px; padding:12px; background:#fff; }
      `}</style>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#ecfeff', color: '#0f766e', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {success}
        </div>
      )}
      {warningMessage && (
        <div style={{ background: '#fff7ed', color: '#b45309', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          ⚠️ {warningMessage}
        </div>
      )}

      {/* Manual prescription form */}
      <div className="prescription-section" style={{ marginBottom: 16 }}>
        <div className="prescription-header">
          <h3>Custom Prescription</h3>
          <button className="btn-add-prescription" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Tutup' : 'Tambah Resep Manual'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="prescription-form">
            <div className="form-row">
              <div className="form-group">
                <label>Medication Name</label>
                <input
                  type="text"
                  name="medication_name"
                  value={formData.medication_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Clopidogrel"
                />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="75 mg"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Frequency per day</label>
                <select
                  name="frequency_per_day"
                  value={formData.frequency_per_day}
                  onChange={handleInputChange}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n}x/day</option>
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
                  placeholder="After meals"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-row full">
              <div className="form-group">
                <label>Dosing Times</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {formData.dosing_times.map((t, idx) => (
                    <input
                      key={idx}
                      type="time"
                      value={t}
                      onChange={(e) => handleDosingTimeChange(idx, e.target.value)}
                      style={{ width: 120 }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, dosing_times: [...prev.dosing_times, '08:00'] }))}
                    className="btn-add-prescription"
                    style={{ background: '#E0BEE6', color: '#111827' }}
                  >
                    + Waktu
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" className="btn-add-prescription" disabled={loading}>
                {loading ? 'Saving...' : 'Save Prescription'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--color-border)', background: '#fff' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Legacy + catalog assignments */}
      <div className="prescription-section">
        <div className="prescription-header">
          <h3>Active Orders</h3>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Custom + Catalog</span>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {prescriptions.map((prescription) => (
            <div key={prescription.prescription_id} className="prescription-card">
              <div style={{ fontWeight: 700 }}>{prescription.medication_name}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{prescription.dosage}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {prescription.frequency_per_day}x/day • {prescription.instructions || 'No instructions'}
              </div>
            </div>
          ))}
          {patientMeds.map((med) => (
            <div key={med.patient_med_id} className="prescription-card" style={{ borderColor: '#E0BEE6' }}>
              <div style={{ fontWeight: 700 }}>{med.medication.medication_name}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{med.medication.dosage_standard}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {med.medication.product_category} • {med.medication.manufacturer}
              </div>
            </div>
          ))}
          {prescriptions.length === 0 && patientMeds.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Belum ada resep untuk pasien ini.</div>
          )}
        </div>
      </div>
    </div>
  );
}
