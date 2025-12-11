import React, { useState, useEffect } from 'react';
import { exerciseCatalogAPI, patientAPI } from '../utils/api';

const EXERCISE_IMAGE_FALLBACKS = {
  'seated marching': 'https://content.healthwise.net/resources/14.7/en-us/media/medical/hw/h9991900_001.jpg',
  'ankle pumps': 'https://i.ytimg.com/vi/-twMbBmHwso/maxresdefault.jpg',
  'shoulder flex slide': 'https://i.ytimg.com/vi/pgsPQ1_5e0w/sddefault.jpg',
  'grip and release': 'https://cdn.shopifycdn.net/s/files/1/2350/9323/files/description_image_02.jpg?v=1637810820',
  'balloon toss': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgLuzTixGF7CGYuhsUIlc4FUBna7lQznXZ8FyPMrtw-w&s',
  'music-assisted arm reach': 'https://theayurveda.files.wordpress.com/2014/05/hand-exercise.jpg',
  'tongue strengthening': 'https://www.verywellhealth.com/thmb/q6lBlK32y-SASqvUuPysCzjrPtY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/what-is-speech-therapy-906825-30d22d2de55146f5a991f0e2f1a0b826.jpg',
  'facial cue practice': 'https://www.childreachcenter.com/wp-content/uploads/2017/09/Articulation-Practice-Long-EE-1024x683.jpg',
  'mindfulness breathing': 'https://i0.wp.com/post.healthline.com/wp-content/uploads/2020/09/Meditation_Meditating_Woman_Tree_Nature-1296x728-Header.jpg?w=1155&h=1528',
  'memory card sorting': 'https://images.squarespace-cdn.com/content/v1/5c1a6b09e17ba375c4f9d4d7/1571341168511-EF2A9BG4UANYS749R0MC/Memory+cards.jpg'
};

const getExerciseImage = (exercise) => {
  const key = (exercise?.exercise_name || '').toLowerCase();
  if (EXERCISE_IMAGE_FALLBACKS[key]) return EXERCISE_IMAGE_FALLBACKS[key];
  if (exercise?.image_url && exercise.image_url.trim()) return exercise.image_url;
  return 'https://via.placeholder.com/300x200?text=Exercise';
};

export default function ExerciseCatalogEntry({ user, onSuccess }) {
  const [exercises, setExercises] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('PHYSICAL');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [expandedExId, setExpandedExId] = useState(null);
  const [patientExercises, setPatientExercises] = useState([]);

  const specializations = user?.specialization
    ? [user.specialization.toUpperCase()]
    : ['PHYSICAL', 'OCCUPATIONAL', 'RECREATIONAL', 'SPEECH', 'PSYCHOLOGIST', 'DIETITIAN'];

  useEffect(() => {
    if (user?.role === 'therapist') {
      const spec = user?.specialization ? user.specialization.toUpperCase() : selectedSpecialization;
      setSelectedSpecialization(spec);
      fetchExercises(spec);
      fetchPatients();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientExercises(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchExercises = async (specialization) => {
    try {
      const response = await exerciseCatalogAPI.getBySpecialization(specialization);
      if (response.success) {
        setExercises(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setExercises([]);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getMyPatients();
      if (response.success) {
        setPatients(Array.isArray(response.data) ? response.data : []);
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setPatients([]);
    }
  };

  const fetchPatientExercises = async (patientId) => {
    try {
      const response = await exerciseCatalogAPI.getPatientExercises(patientId);
      if (response.success) {
        setPatientExercises(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching patient exercises:', err);
    }
  };

  const handleAssignExercise = async (exerciseId) => {
    if (!selectedPatient) {
      setError('Pilih pasien terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await exerciseCatalogAPI.assignToPatient(exerciseId, selectedPatient);
      if (response.success) {
        setMessage('Latihan berhasil ditambahkan ke pasien');
        fetchPatientExercises(selectedPatient);
        setExpandedExId(null);
        if (onSuccess) onSuccess();
      } else {
        setError(response.message || 'Gagal menambahkan latihan');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="exercise-catalog-entry" style={{ padding: '20px', marginTop: '20px' }}>
      <h3 style={{ marginTop: 0 }}>Exercise Catalog</h3>

      {error && (
        <div style={{
          color: '#d32f2f',
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          color: '#388e3c',
          backgroundColor: 'rgba(56, 142, 60, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      {/* Patient Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Select Patient
        </label>
        <select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            fontSize: '14px'
          }}
        >
          <option value="">-- Choose Patient --</option>
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.name || p.patient_name || 'Unknown'}
            </option>
          ))}
        </select>
      </div>

      {/* Specialization Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Therapist Specialization
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => {
                setSelectedSpecialization(spec);
                fetchExercises(spec);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: selectedSpecialization === spec ? '2px solid var(--blue)' : '1px solid var(--color-border)',
                backgroundColor: selectedSpecialization === spec ? 'rgba(68, 161, 209, 0.1)' : 'transparent',
                color: selectedSpecialization === spec ? 'var(--blue)' : 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '12px',
                pointerEvents: specializations.length === 1 ? 'none' : 'auto',
                opacity: specializations.length === 1 ? 0.6 : 1
              }}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Catalog Grid */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Available Exercises ({exercises.length}) - {selectedSpecialization}</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '14px',
          overflowX: 'auto'
        }}>
          {exercises.map((ex) => (
            <div
              key={ex.exercise_id}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--color-card)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
              }}
            >
              {/* Exercise Image */}
              <img
                src={getExerciseImage(ex)}
                alt={ex.exercise_name}
                referrerPolicy="no-referrer"
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  backgroundColor: '#f5f5f5'
                }}
                onError={(e) => {
                  e.target.src = getExerciseImage(ex);
                  e.target.style.objectFit = 'contain';
                  e.target.style.backgroundColor = '#fafafa';
                }}
              />

              {/* Exercise Info */}
              <div style={{ padding: '14px' }}>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                  {ex.exercise_name}
                </h5>
                <div style={{ fontSize: '12px', color: 'var(--color-muted-2)', marginBottom: '8px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Frequency:</strong> {ex.frequency_per_day}x daily
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Duration:</strong> {ex.duration_minutes} minutes
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Type:</strong> {ex.specialization}
                  </div>
                </div>

                {/* Quick Info Button */}
                <button
                  onClick={() => setExpandedExId(expandedExId === (ex.catalog_id || ex.exercise_id) ? null : (ex.catalog_id || ex.exercise_id))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'rgba(104, 161, 209, 0.1)',
                    border: '1px solid #68A1D1',
                    borderRadius: '6px',
                    color: '#68A1D1',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}
                >
                  {expandedExId === (ex.catalog_id || ex.exercise_id) ? 'Hide Instructions' : 'View Instructions'}
                </button>

                {/* Expanded Details */}
                {expandedExId === (ex.catalog_id || ex.exercise_id) && (
                  <div style={{
                    backgroundColor: 'rgba(104, 161, 209, 0.05)',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    fontSize: '12px',
                    lineHeight: '1.5'
                  }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>Description:</strong>
                      <p style={{ margin: '4px 0 0 0' }}>{ex.description}</p>
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>Instructions:</strong>
                      <p style={{ margin: '4px 0 0 0' }}>{ex.instructions}</p>
                    </div>
                    {ex.tutorial_url && (
                      <div>
                        <strong>Tutorial:</strong>{' '}
                        <a href={ex.tutorial_url} target="_blank" rel="noopener noreferrer" style={{ color: '#68A1D1' }}>
                          Watch Video
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Add Button */}
                <button
                  onClick={() => handleAssignExercise(ex.catalog_id || ex.exercise_id)}
                  disabled={loading || !selectedPatient}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'var(--blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: loading || !selectedPatient ? 'not-allowed' : 'pointer',
                    opacity: loading || !selectedPatient ? 0.6 : 1,
                    fontSize: '14px'
                  }}
                >
                  {loading ? 'Adding...' : 'Add to Patient'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {exercises.length === 0 && (
          <p style={{ color: 'var(--color-muted-2)', textAlign: 'center', padding: '20px' }}>
            No exercises found for this specialization
          </p>
        )}
      </div>

      {/* Patient Exercises */}
      {selectedPatient && (
        <div style={{ marginTop: '24px' }}>
          <h4>Patient Exercises ({patientExercises.length})</h4>
          {patientExercises.length === 0 ? (
            <p style={{ color: 'var(--color-muted-2)' }}>No exercises assigned yet</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {patientExercises.map((ex) => (
                <div
                  key={ex.exercise_id}
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(56, 142, 60, 0.05)',
                    border: '1px solid #388e3c',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {ex.exercise_name}
                  </div>
                  <div style={{ color: 'var(--color-muted-2)', marginBottom: '4px' }}>
                    {ex.frequency_per_day}x daily, {ex.duration_minutes} min
                  </div>
                  <div style={{ color: '#388e3c', fontWeight: '500' }}>
                    Status: Assigned
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
