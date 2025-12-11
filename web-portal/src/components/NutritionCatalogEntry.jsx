import React, { useState, useEffect } from 'react';
import { nutritionCatalogAPI, patientAPI, logAPI } from '../utils/api';

const FOOD_IMAGE_FALLBACKS = {
  'oatmeal dengan buah beri': 'https://www.pcrm.org/sites/default/files/Oatmeal%20and%20Berries.jpg',
  'ikan salmon panggang': 'https://api.photon.aremedia.net.au/wp-content/uploads/sites/12/media/44356/roasted-citrus-salmon.jpg?resize=682%2C1023',
  'sup sayur rendah garam': 'https://www.cookingclassy.com/wp-content/uploads/2014/10/vegetable-soup-7.jpg',
  'tumis bayam dan jamur': 'https://www.justataste.com/wp-content/uploads/2009/03/spinach-mushrooms-garlic.jpg',
  'smoothie alpukat yogurt rendah lemak': 'https://www.dianekochilas.com/wp-content/uploads/2021/01/avocado-yogurt-greek-honey-smoothie-500x500.jpg',
  'infused water': 'https://s3-publishing-cmn-svc-prd.s3.ap-southeast-1.amazonaws.com/article/n1-N3EIolcgxAUP3vuptm/original/086886500_1550828061-Benarkah-Infused-Water-Lebih-Sehat-dari-Air-Minum-Biasa-By-Tatiana-Bralnina-Shutterstock.jpg',
  'kacang almond panggang tanpa garam': 'https://i0.wp.com/post.healthline.com/wp-content/uploads/2023/02/Almonds-Table-Bowl-1296x728-Header.jpg?w=1155&h=1528',
  'brokoli kukus dengan minyak zaitun': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN-56aJ_NnWSMtb4fluA7UyFOpXFZCLVgBLg&s',
  'dada ayam panggang tanpa kulit': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPEQl2C3DVVLKJ5suRcGooiCWXMDXi3aW5jA&s',
  'roti gandum utuh': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcMD45JRqz3linBj9CPkcHYAL44Vj3yP9kIA&s',
  'buah berry campur': 'https://www.realsimple.com/thmb/h4BMDxUEB1nibsFKSS3eOipxCyg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/what-is-the-healthiest-berry-realsimple-GettyImages-889651610-57233cfb91cb4009bba9c16fb0a54221.jpg',
  'yogurt rendah lemak plain': 'https://www.batamnews.co.id/foto_berita//40ky.PNG'
};

const normalizeName = (name = '') => name.toLowerCase().trim();
const getFoodImage = (food) => {
  const key = normalizeName(food?.food_name);
  // Prefer mapped fallback to guarantee consistency with seed
  if (FOOD_IMAGE_FALLBACKS[key]) return FOOD_IMAGE_FALLBACKS[key];
  if (food?.image_url && food.image_url.trim()) return food.image_url;
  return 'https://via.placeholder.com/300x200?text=Nutrition';
};

export default function NutritionCatalogEntry({ user, onSuccess }) {
  const [foods, setFoods] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('main_course');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [patientFoods, setPatientFoods] = useState([]);
  const [mealType, setMealType] = useState('breakfast');
  const [selectedDays, setSelectedDays] = useState(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']);

  const categories = ['main_course', 'vegetable', 'snack', 'beverages'];
  const categoryLabels = {
    main_course: 'Main Course',
    vegetable: 'Vegetables',
    snack: 'Snacks',
    beverages: 'Beverages'
  };

  const formatMealType = (value = '') => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Meal';

  const dayOptions = [
    'monday','tuesday','wednesday','thursday','friday','saturday','sunday'
  ];

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchFoods(selectedCategory);
      fetchPatients();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientFoods(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchFoods = async (category) => {
    try {
      const response = await nutritionCatalogAPI.getByCategory(category);
      if (response.success) {
        setFoods(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching foods:', err);
      setFoods([]);
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

  const fetchPatientFoods = async (patientId) => {
    try {
      const response = await nutritionCatalogAPI.getPatientFoods(patientId);
      if (response.success) {
        setPatientFoods(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching patient foods:', err);
    }
  };

  const nextDateForDay = (day) => {
    const map = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    const targetDay = map[day?.toLowerCase()] ?? 0;
    const today = new Date();
    const diff = (targetDay + 7 - today.getDay()) % 7 || 7;
    const next = new Date(today);
    next.setDate(today.getDate() + diff);
    return next;
  };

  const handleAssignFood = async (catalogId) => {
    if (!selectedPatient) {
      setError('Pilih pasien terlebih dahulu');
      return;
    }
    if (!mealType) {
      setError('Pilih waktu makan');
      return;
    }
    if (!selectedDays.length) {
      setError('Pilih minimal satu hari');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await nutritionCatalogAPI.assignToPatient(catalogId, selectedPatient);
      if (response.success) {
        setMessage('Makanan berhasil ditambahkan ke pasien');
        // Buat log meal sesuai hari dan waktu makan agar muncul di history
        const food = foods.find(f => (f.catalog_id || f.food_id) === catalogId) || selectedFood;
        const createLogs = selectedDays.map(async (day) => {
          const logDate = nextDateForDay(day);
          return logAPI.meal.create({
            patient_id: selectedPatient,
            logged_for: logDate.toISOString(),
            meal_type: mealType,
            foods: [food?.food_name || 'Meal plan'],
            calories: food?.calories || 0,
            sodium_mg: food?.sodium_mg || 0,
            fiber_g: food?.fiber_g || 0
          }).catch(() => null);
        });
        await Promise.all(createLogs);

        fetchPatientFoods(selectedPatient);
        setSelectedFood(null);
        if (onSuccess) onSuccess();
      } else {
        setError(response.message || 'Gagal menambahkan makanan');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="nutrition-catalog-entry" style={{ padding: '20px', marginTop: '20px' }}>
      <h3 style={{ marginTop: 0 }}>Nutrition Catalog</h3>

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

      {/* Assignment options */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '16px',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Meal Time</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontSize: '14px'
            }}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Days</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: 420 }}>
            {dayOptions.map((day) => (
              <label key={day} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDays([...selectedDays, day]);
                    } else {
                      setSelectedDays(selectedDays.filter(d => d !== day));
                    }
                  }}
                />
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Food Category
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                fetchFoods(cat);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: selectedCategory === cat ? '2px solid var(--blue)' : '1px solid var(--color-border)',
                backgroundColor: selectedCategory === cat ? 'rgba(68, 161, 209, 0.1)' : 'transparent',
                color: selectedCategory === cat ? 'var(--blue)' : 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '12px'
              }}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Food Catalog Grid */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Available Foods ({foods.length}) - {categoryLabels[selectedCategory]}</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px'
        }}>
          {foods.map((food) => (
            <div
              key={food.catalog_id || food.food_id}
              onClick={() => setSelectedFood(food)}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--color-card)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
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
              {/* Food Image */}
              <img
                src={getFoodImage(food)}
                alt={food.food_name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  backgroundColor: '#f5f5f5'
                }}
                onError={(e) => {
                  e.target.src = getFoodImage(food);
                  e.target.style.objectFit = 'contain';
                  e.target.style.backgroundColor = '#fafafa';
                }}
              />

              {/* Food Info */}
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>
                  {food.food_name}
                </h5>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--color-muted-2)' }}>
                  {categoryLabels[food.food_category] || 'Any'} • {formatMealType(food.meal_type)}
                </p>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-muted)' }}>
                  {food.description}
                </p>
                <div style={{ fontSize: '12px', color: 'var(--color-muted-2)', marginBottom: '12px', display: 'grid', gap: '6px' }}>
                  <span>⚡ {food.calories} kcal</span>
                  <span>🧂 {food.sodium_mg} mg sodium</span>
                  <span>🌾 {food.fiber_g} g fiber</span>
                </div>

                {/* Add Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssignFood(food.catalog_id || food.food_id);
                  }}
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
        {foods.length === 0 && (
          <p style={{ color: 'var(--color-muted-2)', textAlign: 'center', padding: '20px' }}>
            No foods found in this category
          </p>
        )}
      </div>

      {selectedFood && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '240px',
                height: '200px',
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                <img
                  src={getFoodImage(selectedFood)}
                  alt={selectedFood.food_name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = getFoodImage(selectedFood); e.target.style.objectFit = 'contain'; }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                  {selectedFood.food_name}
                </h2>
                <p style={{ margin: '0 0 10px 0', color: '#4b5563', fontSize: '14px' }}>
                  {categoryLabels[selectedFood.food_category] || 'Nutrition'} • {formatMealType(selectedFood.meal_type)}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Target Kalori</div>
                    <div style={{ fontWeight: 700 }}>{selectedFood.calories} kcal</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Batas Sodium</div>
                    <div style={{ fontWeight: 700 }}>{selectedFood.sodium_mg} mg</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Serat</div>
                    <div style={{ fontWeight: 700 }}>{selectedFood.fiber_g} g</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Cairan Harian</div>
                    <div style={{ fontWeight: 700 }}>{selectedFood.fluid_ml || 'Ikuti target pasien'} {selectedFood.fluid_ml ? 'ml' : ''}</div>
                  </div>
                </div>
                <p style={{ margin: '0', color: '#374151', fontSize: '14px', lineHeight: 1.6 }}>
                  {selectedFood.description}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  if (selectedPatient) handleAssignFood(selectedFood.food_id);
                }}
                disabled={loading || !selectedPatient}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#44a1d1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading || !selectedPatient ? 'not-allowed' : 'pointer',
                  opacity: loading || !selectedPatient ? 0.6 : 1
                }}
              >
                {loading ? 'Adding...' : 'Add to Patient'}
              </button>
              <button
                onClick={() => setSelectedFood(null)}
                style={{
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontWeight: 600,
                  minWidth: '120px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Foods */}
      {selectedPatient && (
        <div style={{ marginTop: '24px' }}>
          <h4>Patient Foods ({patientFoods.length})</h4>
          {patientFoods.length === 0 ? (
            <p style={{ color: 'var(--color-muted-2)' }}>No foods assigned yet</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {patientFoods.map((food) => (
                <div
                  key={food.catalog_id || food.food_id}
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(56, 142, 60, 0.05)',
                    border: '1px solid #388e3c',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {food.food_name}
                  </div>
                  <div style={{ color: 'var(--color-muted-2)', marginBottom: '4px' }}>
                    {food.calories} kcal · {food.meal_type}
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
