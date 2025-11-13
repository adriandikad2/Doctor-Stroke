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
    <section className="diet-management" style={{ marginTop: 20 }}>
      <h3>Manajemen Diet (Nutrisi)</h3>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="patient-select" style={{ fontWeight: 600, marginRight: 8 }}>Pilih Pasien:</label>
        <select 
          id="patient-select" 
          value={selectedPatientId} 
          onChange={(e) => setSelectedPatientId(e.target.value)}
          style={{ marginBottom: 0 }} // Hapus margin bottom
        >
          <option value="">-- Pilih --</option>
          {patients.map(p => (
            <option key={p.patient_id} value={p.patient_id}>{p.name}</option>
          ))}
        </select>
        {loading && <span style={{ marginLeft: 10 }}>Memuat...</span>}
      </div>

      {!selectedPatientId && !loading && (
        <p style={{ color: 'var(--muted-2)' }}>Silakan pilih pasien untuk melihat data nutrisi.</p>
      )}

      {selectedPatientId && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          
          {/* Hapus inline styles dari form elements */}
          <div className="form-card">
            <h4 style={{ marginTop: 0 }}>Profil Nutrisi</h4>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: 8 }}>
                <label>Batas Sodium (mg)</label>
                <input 
                  type="number" 
                  name="sodium_mg"
                  value={formData.sodium_mg} 
                  onChange={(e) => handleFormChange(e, setFormData)} 
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Target Serat (g)</label>
                <input 
                  type="number" 
                  name="fiber_g"
                  value={formData.fiber_g} 
                  onChange={(e) => handleFormChange(e, setFormData)} 
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Target Kalori (Max)</label>
                <input 
                  type="number" 
                  name="calories"
                  value={formData.calories} 
                  onChange={(e) => handleFormChange(e, setFormData)} 
                />
              </div>
              <button type="submit" style={{ padding:'10px 14px', borderRadius:10, background:'var(--blue)', color:'white', border:'none', marginBottom: 0 }}>Update Profil</button>
            </form>
            
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
            
            <h4 style={{ marginTop: 0 }}>Catat Makanan Baru</h4>
            <form onSubmit={handleLogMeal}>
              <select name="meal_type" value={mealFormData.meal_type} onChange={(e) => handleFormChange(e, setMealFormData)}>
                <option value="breakfast">Sarapan</option>
                <option value="lunch">Makan Siang</option>
                <option value="dinner">Makan Malam</option>
                <option value="snack">Camilan</option>
              </select>
              <input name="foods" value={mealFormData.foods} onChange={(e) => handleFormChange(e, setMealFormData)} placeholder="Makanan (cth: oatmeal, apel)" />
              <input name="calories" value={mealFormData.calories} onChange={(e) => handleFormChange(e, setMealFormData)} placeholder="Kalori (kkal)" type="number" />
              <input name="sodium_mg" value={mealFormData.sodium_mg} onChange={(e) => handleFormChange(e, setMealFormData)} placeholder="Sodium (mg)" type="number" />
              <input name="fiber_g" value={mealFormData.fiber_g} onChange={(e) => handleFormChange(e, setMealFormData)} placeholder="Serat (g)" type="number" />
              <button type="submit" style={{ padding:'10px 14px', borderRadius:10, background:'var(--green)', color:'white', border:'none', marginBottom: 0 }}>Catat Makanan</button>
            </form>
          </div>
          
          <div className="form-card" style={{ overflow: 'auto' }}>
            <h4 style={{ marginTop: 0 }}>Rencana Makan (3 Hari)</h4>
            {plan && plan.plan.map(day => (
              <div key={day.day} style={{ marginBottom: 12 }}>
                <strong style={{ display: 'block', borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>{day.day}</strong>
                <ul style={{ listStyle: 'none', paddingLeft: 10, fontSize: 14 }}>
                  <li><b>Sarapan:</b> {day.meals.breakfast.title}</li>
                  <li><b>Siang:</b> {day.meals.lunch.title}</li>
                  <li><b>Malam:</b> {day.meals.dinner.title}</li>
                  <li><b>Camilan:</b> {day.meals.snack.title}</li>
                </ul>
              </div>
            ))}
            
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
            
            <h4 style={{ marginTop: 0 }}>Riwayat Makanan Tercatat</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14 }}>
              {meals.length > 0 ? meals.map(meal => (
                <li key={meal.meal_id} style={{ padding: 8, borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 700 }}>{meal.logged_for}: {meal.meal_type}</div>
                  <div style={{ color: 'var(--color-muted-2)' }}>{meal.foods.join(', ')}</div>
                  <div style={{ color: 'var(--color-muted-2)', fontSize: 12 }}>
                    {meal.calories} kkal, {meal.sodium_mg}mg Na, {meal.fiber_g}g serat
                  </div>
                  {meal.feedback && meal.feedback.status === 'warning' && (
                    <div style={{ color: 'orange', fontSize: 12, fontWeight: 600 }}>
                      Feedback: {meal.feedback.notes.join(' ')}
                    </div>
                  )}
                </li>
              )) : <p style={{ color: 'var(--color-muted-2)' }}>Belum ada makanan tercatat.</p>}
            </ul>
          </div>

        </div>
      )}
    </section>
  );
}