import React, { useState, useEffect } from 'react';

// Fungsi helper untuk melakukan fetch dengan otentikasi
async function authedFetch(url, options = {}) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = new Headers(options.headers || {});
  headers.append('Authorization', `Bearer ${token}`);
  headers.append('Content-Type', 'application/json');

  const res = await fetch(url, { ...options, headers });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'API request failed');
  }
  return res.json();
}

export default function DietManagement() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [meals, setMeals] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State untuk form
  const [formData, setFormData] = useState({
    calories: '',
    sodium_mg: '',
    fiber_g: ''
  });
  
  const [mealFormData, setMealFormData] = useState({
    meal_type: 'snack',
    foods: '',
    calories: '',
    sodium_mg: '',
    fiber_g: ''
  });

  // 1. Ambil daftar pasien saat komponen dimuat
  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);
      setError('');
      try {
        const data = await authedFetch('/api/patients');
        setPatients(data.patients || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchPatients();
  }, []);

  // 2. Ambil data nutrisi saat pasien dipilih
  useEffect(() => {
    if (!selectedPatientId) {
      setProfile(null);
      setPlan(null);
      setMeals([]);
      return;
    }

    async function fetchDataForPatient() {
      setLoading(true);
      setError('');
      try {
        const [profileData, planData, mealsData] = await Promise.all([
          authedFetch(`/api/nutrition/patient/${selectedPatientId}/profile`),
          authedFetch(`/api/nutrition/patient/${selectedPatientId}/plan?days=3`),
          authedFetch(`/api/nutrition/patient/${selectedPatientId}/meals`)
        ]);
        
        setProfile(profileData.profile);
        setPlan(planData);
        setMeals(mealsData.meals || []);
        
        if (profileData.profile) {
          setFormData({
            calories: profileData.profile.calorie_target_max || 1800,
            sodium_mg: profileData.profile.sodium_limit_mg || 1500,
            fiber_g: profileData.profile.fiber_target_g || 25
          });
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchDataForPatient();
  }, [selectedPatientId]);
  
  // Handler untuk update profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        calorie_target_max: parseInt(formData.calories, 10),
        sodium_limit_mg: parseInt(formData.sodium_mg, 10),
        fiber_target_g: parseInt(formData.fiber_g, 10)
      };
      const data = await authedFetch(`/api/nutrition/patient/${selectedPatientId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setProfile(data.profile);
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };
  
  // Handler untuk mencatat makanan
  const handleLogMeal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        meal_type: mealFormData.meal_type,
        foods: mealFormData.foods.split(',').map(f => f.trim()),
        calories: parseInt(mealFormData.calories, 10) || 0,
        sodium_mg: parseInt(mealFormData.sodium_mg, 10) || 0,
        fiber_g: parseInt(mealFormData.fiber_g, 10) || 0,
      };
      const data = await authedFetch(`/api/nutrition/patient/${selectedPatientId}/meals`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      alert(`Makanan dicatat! Feedback: ${data.feedback.notes.join(' ') || 'OK'}`);
      setMeals([data.meal, ...meals]);
      setMealFormData({ meal_type: 'snack', foods: '', calories: '', sodium_mg: '', fiber_g: '' });
      
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };
  
  const handleFormChange = (e, formSetter) => {
    formSetter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section className="diet-management" style={{ marginTop: 20, animation: 'fadeIn 0.5s ease-in-out' }}>
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

        .diet-management {
          max-width: 1200px;
          margin: 20px auto;
          padding: 20px;
        }

        .diet-management h3 {
          color: var(--primary);
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .diet-management h3::before {
          content: '🥗';
          font-size: 28px;
        }

        .patient-selector {
          background: var(--color-card);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 12px 30px rgba(14, 30, 45, 0.06);
          border: 1px solid var(--color-border);
          animation: slideInUp 0.6s ease-out;
        }

        .patient-selector label {
          display: block;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 8px;
          font-size: 14px;
        }

        .patient-selector select {
          width: 100%;
          max-width: 300px;
        }

        .diet-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .form-card {
          background: var(--color-card);
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(14, 30, 45, 0.06);
          border: 1px solid var(--color-border);
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .form-card:nth-child(1) { animation-delay: 0.2s; }
        .form-card:nth-child(2) { animation-delay: 0.3s; }

        .form-card h4 {
          margin: 0 0 16px 0;
          color: var(--primary);
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-card form {
          display: grid;
          gap: 12px;
        }

        .form-card label {
          display: block;
          font-weight: 600;
          font-size: 13px;
          color: var(--color-text);
          margin-bottom: 4px;
        }

        .form-card input,
        .form-card select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-bg);
          color: var(--color-text);
          font-size: 13px;
          margin-bottom: 0;
          transition: all 0.3s ease;
        }

        .form-card input:focus,
        .form-card select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(131, 133, 204, 0.1);
        }

        .form-card button {
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
          font-size: 14px;
        }

        .form-card button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .diet-divider {
          margin: 24px 0;
          border: none;
          border-top: 1px solid var(--color-border);
        }

        .meal-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .meal-item {
          padding: 12px;
          margin-bottom: 8px;
          background: var(--color-bg);
          border-radius: 8px;
          border-left: 4px solid var(--teal);
          transition: all 0.3s ease;
          animation: slideInUp 0.4s ease-out forwards;
          opacity: 0;
        }

        .meal-item:hover {
          box-shadow: 0 4px 12px rgba(121, 174, 179, 0.15);
          transform: translateX(4px);
        }

        .meal-item .meal-time {
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 4px 0;
          font-size: 13px;
        }

        .meal-item .meal-foods {
          color: var(--color-muted-2);
          margin: 0 0 6px 0;
          font-size: 12px;
        }

        .meal-item .meal-nutrition {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: var(--color-muted-2);
        }

        .meal-item .meal-feedback {
          color: #FFA500;
          font-size: 11px;
          font-weight: 600;
          margin-top: 6px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--color-muted-2);
        }

        .error-message {
          background: #FEE2E2;
          color: #DC2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          border-left: 4px solid #DC2626;
        }

        .loading-spinner {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 3px solid var(--color-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-left: 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1000px) {
          .diet-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h3>Manajemen Diet & Nutrisi</h3>
      
      {error && <div className="error-message">❌ Error: {error}</div>}
      
      <div className="patient-selector">
        <label htmlFor="patient-select">🏥 Pilih Pasien</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select 
            id="patient-select" 
            value={selectedPatientId} 
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{ marginBottom: 0 }}
          >
            <option value="">-- Pilih Pasien --</option>
            {patients.map(p => (
              <option key={p.patient_id} value={p.patient_id}>{p.name}</option>
            ))}
          </select>
          {loading && <div className="loading-spinner"></div>}
        </div>
      </div>

      {!selectedPatientId && !loading && (
        <div className="empty-state">
          <p style={{ fontSize: '14px' }}>👉 Silakan pilih pasien untuk melihat data nutrisi dan rencana diet.</p>
        </div>
      )}

      {selectedPatientId && !loading && (
        <div className="diet-grid">
          
          {/* Left Panel: Forms */}
          <div>
            <div className="form-card">
              <h4>📋 Profil Nutrisi</h4>
              <form onSubmit={handleUpdateProfile}>
                <div>
                  <label>Batas Sodium (mg)</label>
                  <input 
                    type="number" 
                    name="sodium_mg"
                    value={formData.sodium_mg} 
                    onChange={(e) => handleFormChange(e, setFormData)} 
                    placeholder="mis: 1500"
                  />
                </div>
                <div>
                  <label>Target Serat (g)</label>
                  <input 
                    type="number" 
                    name="fiber_g"
                    value={formData.fiber_g} 
                    onChange={(e) => handleFormChange(e, setFormData)} 
                    placeholder="mis: 25"
                  />
                </div>
                <div>
                  <label>Target Kalori (Maksimal)</label>
                  <input 
                    type="number" 
                    name="calories"
                    value={formData.calories} 
                    onChange={(e) => handleFormChange(e, setFormData)} 
                    placeholder="mis: 1800"
                  />
                </div>
                <button type="submit" style={{ background: 'var(--blue)', color: 'white' }}>
                  💾 Update Profil
                </button>
              </form>
              
              <hr className="diet-divider" />
              
              <h4>🍽️ Catat Makanan Baru</h4>
              <form onSubmit={handleLogMeal}>
                <div>
                  <label>Jenis Makanan</label>
                  <select name="meal_type" value={mealFormData.meal_type} onChange={(e) => handleFormChange(e, setMealFormData)}>
                    <option value="breakfast">🌅 Sarapan</option>
                    <option value="lunch">☀️ Makan Siang</option>
                    <option value="dinner">🌙 Makan Malam</option>
                    <option value="snack">🍪 Camilan</option>
                  </select>
                </div>
                <div>
                  <label>Makanan (pisahkan dengan koma)</label>
                  <input name="foods" value={mealFormData.foods} onChange={(e) => handleFormChange(e, setMealFormData)} placeholder="mis: oatmeal, apel, susu" />
                </div>
                <div>
                  <label>Kalori (kkal)</label>
                  <input name="calories" value={mealFormData.calories} onChange={(e) => handleFormChange(e, setMealFormData)} placeholder="mis: 350" type="number" />
                </div>
                <div>
                  <label>Sodium (mg)</label>
                  <input name="sodium_mg" value={mealFormData.sodium_mg} onChange={(e) => handleFormChange(e, setMealFormData)} placeholder="mis: 200" type="number" />
                </div>
                <div>
                  <label>Serat (g)</label>
                  <input name="fiber_g" value={mealFormData.fiber_g} onChange={(e) => handleFormChange(e, setMealFormData)} placeholder="mis: 5" type="number" />
                </div>
                <button type="submit" style={{ background: 'var(--green)', color: 'white' }}>
                  ✏️ Catat Makanan
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Data & Plans */}
          <div>
            <div className="form-card">
              <h4>📅 Rencana Makan (3 Hari)</h4>
              {plan && plan.plan && plan.plan.length > 0 ? (
                <div style={{ fontSize: '13px' }}>
                  {plan.plan.map((day, idx) => (
                    <div key={day.day} style={{ marginBottom: '12px' }} className="meal-item">
                      <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--primary)' }}>{day.day}</strong>
                      <p style={{ margin: '2px 0', fontSize: '11px' }}>🌅 Sarapan: {day.meals.breakfast.title}</p>
                      <p style={{ margin: '2px 0', fontSize: '11px' }}>☀️ Siang: {day.meals.lunch.title}</p>
                      <p style={{ margin: '2px 0', fontSize: '11px' }}>🌙 Malam: {day.meals.dinner.title}</p>
                      <p style={{ margin: '2px 0', fontSize: '11px' }}>🍪 Camilan: {day.meals.snack.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted-2)', textAlign: 'center', fontSize: '12px' }}>Belum ada rencana makan</p>
              )}
            </div>

            <div className="form-card">
              <h4>📝 Riwayat Makanan Tercatat</h4>
              <div className="meal-list">
                {meals.length > 0 ? meals.map((meal, idx) => (
                  <div key={meal.meal_id || idx} className="meal-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <p className="meal-time">{meal.logged_for}: {meal.meal_type}</p>
                    <p className="meal-foods">🍽️ {meal.foods.join(', ')}</p>
                    <div className="meal-nutrition">
                      <span>⚡ {meal.calories} kkal</span>
                      <span>🧂 {meal.sodium_mg}mg Na</span>
                      <span>🌾 {meal.fiber_g}g Serat</span>
                    </div>
                    {meal.feedback && meal.feedback.status === 'warning' && (
                      <p className="meal-feedback">⚠️ {meal.feedback.notes.join(', ')}</p>
                    )}
                  </div>
                )) : (
                  <p style={{ color: 'var(--color-muted-2)', textAlign: 'center', fontSize: '12px', padding: '20px 0' }}>
                    Belum ada makanan tercatat. Mulai catat sekarang! 👇
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}