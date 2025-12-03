import React, { useState, useEffect } from 'react';
import { patientAPI, nutritionAPI, logAPI } from './utils/api';

// Calendar component for viewing logged meals by date
const MealCalendar = ({ patientId, authToken, onSelectDate }) => {
  const [calendarData, setCalendarData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Function to load meal data for the month
  useEffect(() => {
    const loadCalendarData = async () => {
      if (!patientId || !authToken) return;
      
      setLoading(true);
      try {
        // Get start and end of month for query
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        const response = await fetch(`/api/logs/meal/${patientId}?start_date=${startOfMonth.toISOString().split('T')[0]}&end_date=${endOfMonth.toISOString().split('T')[0]}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.data) {
          // Group meals by date
          const mealsByDate = {};
          data.data.forEach(meal => {
            const date = meal.logged_for.split('T')[0]; // Extract YYYY-MM-DD
            if (!mealsByDate[date]) {
              mealsByDate[date] = [];
            }
            mealsByDate[date].push(meal);
          });
          
          setCalendarData(mealsByDate);
        }
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCalendarData();
  }, [patientId, authToken, currentMonth]);

  // Navigation functions for calendar
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push(dateStr);
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="meal-calendar">
      <style>{`
        .meal-calendar {
          background: var(--color-card);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 12px 30px rgba(14, 30, 45, 0.06);
          border: 1px solid var(--color-border);
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .month-navigation {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .nav-button {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .nav-button:hover {
          background: var(--primary);
          color: white;
        }
        
        .current-month {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary);
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        
        .weekday-header {
          text-align: center;
          padding: 8px;
          font-weight: 600;
          color: var(--color-muted-2);
          font-size: 12px;
        }
        
        .calendar-day {
          aspect-ratio: 1/1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          min-height: 60px;
        }
        
        .calendar-day.empty {
          background: transparent;
          cursor: default;
        }
        
        .calendar-day.has-meals {
          background: var(--teal-light);
          border: 1px solid var(--teal);
        }
        
        .calendar-day.has-meals:hover {
          background: var(--teal);
          color: white;
        }
        
        .calendar-day.selected {
          background: var(--primary);
          color: white;
        }
        
        .day-number {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .meal-indicator {
          display: flex;
          gap: 2px;
          margin-top: 4px;
        }
        
        .meal-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--teal);
        }
        
        .loading-calendar {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
        }
      `}</style>
      
      <div className="calendar-header">
        <div className="month-navigation">
          <button className="nav-button" onClick={goToPreviousMonth}>←</button>
          <div className="current-month">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button className="nav-button" onClick={goToNextMonth}>→</button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-calendar">
          <div className="spinner">Loading calendar...</div>
        </div>
      ) : (
        <>
          <div className="calendar-grid">
            {weekdays.map(day => (
              <div key={day} className="weekday-header">{day}</div>
            ))}
            
            {days.map((dateStr, index) => {
              if (!dateStr) {
                return <div key={index} className="calendar-day empty"></div>;
              }
              
              const hasMeals = calendarData[dateStr] && calendarData[dateStr].length > 0;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              
              return (
                <div
                  key={dateStr}
                  className={`calendar-day ${hasMeals ? 'has-meals' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => onSelectDate && onSelectDate(dateStr)}
                  title={hasMeals ? `Meals logged on ${dateStr}` : `No meals on ${dateStr}`}
                >
                  <div className="day-number">
                    {parseInt(dateStr.split('-')[2])}
                  </div>
                  {hasMeals && (
                    <div className="meal-indicator">
                      {calendarData[dateStr].slice(0, 3).map((meal, idx) => (
                        <div key={idx} className="meal-dot" title={`${meal.meal_type}: ${meal.foods?.join(', ')}`}></div>
                      ))}
                      {calendarData[dateStr].length > 3 && (
                        <div className="meal-dot" style={{ backgroundColor: '#8385CC' }} title={`+${calendarData[dateStr].length - 3} more meals`}></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default function DietManagement({ user }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State untuk form update nutrition profile
  const [profileForm, setProfileForm] = useState({
    sodium_limit_mg: '',
    fiber_target_g: '',
    calorie_target_max: ''
  });
  
  // State untuk form log meal
  const [mealForm, setMealForm] = useState({
    meal_type: 'breakfast',
    foods_consumed: '',
    calories: '',
    sodium_mg: '',
    fiber_g: ''
  });

  // 1. Fetch patients saat komponen mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await patientAPI.getMyPatients();
        if (response.success) {
          const patientsList = Array.isArray(response.data) ? response.data : [];
          setPatients(patientsList);
          if (patientsList.length > 0) {
            setSelectedPatient(patientsList[0]);
          }
        } else {
          setError(response.message || 'Failed to load patients');
          setPatients([]);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.message || 'Failed to load patients');
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // 2. Fetch nutrition data saat patient dipilih
  useEffect(() => {
    if (!selectedPatient?.patient_id) {
      setProfile(null);
      setMeals([]);
      return;
    }

    const fetchNutritionData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch nutrition profile
        const profileResp = await nutritionAPI.getProfile(selectedPatient.patient_id);
        if (profileResp.success && profileResp.data) {
          setProfile(profileResp.data);
          setProfileForm({
            sodium_limit_mg: profileResp.data.sodium_limit_mg || '',
            fiber_target_g: profileResp.data.fiber_target_g || '',
            calorie_target_max: profileResp.data.calorie_target_max || ''
          });
        }

        // Fetch meal logs
        const mealsResp = await logAPI.meal.getByPatientId(selectedPatient.patient_id);
        if (mealsResp.success && mealsResp.data) {
          setMeals(mealsResp.data);
        }
      } catch (err) {
        setError('Failed to load nutrition data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionData();
  }, [selectedPatient]);
  
  // Handler untuk update profil nutrisi
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient?.patient_id) {
      setError('Please select a patient');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await nutritionAPI.updateProfile(selectedPatient.patient_id, {
        calorie_target_max: parseInt(profileForm.calorie_target_max || 0, 10),
        sodium_limit_mg: parseInt(profileForm.sodium_limit_mg || 0, 10),
        fiber_target_g: parseInt(profileForm.fiber_target_g || 0, 10)
      });

      if (response.success) {
        setProfile(response.data);
        alert('Nutrition profile updated successfully!');
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler untuk log meal
  const handleLogMeal = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient?.patient_id) {
      setError('Please select a patient');
      return;
    }

    if (!mealForm.foods_consumed) {
      setError('Please enter foods consumed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const foodsArray = mealForm.foods_consumed
        .split(',')
        .map(food => food.trim())
        .filter(food => food.length > 0);

      const response = await logAPI.meal.create({
        patient_id: selectedPatient.patient_id,
        logged_for: new Date().toISOString(),
        meal_type: mealForm.meal_type,
        foods: foodsArray, 
        calories: parseInt(mealForm.calories || 0, 10),
        sodium_mg: parseInt(mealForm.sodium_mg || 0, 10),
        fiber_g: parseInt(mealForm.fiber_g || 0, 10)
      });

      if (response.success) {
        alert('Meal logged successfully!');
        setMeals([response.data, ...meals]);
        setMealForm({
          meal_type: 'breakfast',
          foods_consumed: '',
          calories: '',
          sodium_mg: '',
          fiber_g: ''
        });
      } else {
        setError(response.message || 'Failed to log meal');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
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

      <h3>🥗 Nutrition Management</h3>
      
      {error && <div className="error-message">❌ Error: {error}</div>}
      
      <div className="patient-selector">
        <label htmlFor="patient-select">🏥 Select Patient</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select
            id="patient-select"
            value={selectedPatient?.patient_id || ''}
            onChange={(e) => {
              const patient = patients.find(p => p.patient_id === e.target.value);
              setSelectedPatient(patient || null);
            }}
            style={{ marginBottom: 0 }}
          >
            <option value="">-- Select Patient --</option>
            {patients.map(p => (
              <option key={p.patient_id} value={p.patient_id}>{p.name}</option>
            ))}
          </select>
          {loading && <div className="loading-spinner"></div>}
        </div>
      </div>

      {!selectedPatient && !loading && (
        <div className="empty-state">
          <p style={{ fontSize: '14px' }}>👉 Please select a patient to view nutrition data and diet plans.</p>
        </div>
      )}

      {selectedPatient && !loading && (
        <div className="diet-grid">
          
          {/* Left Panel: Forms */}
          <div>
            <div className="form-card">
              <h4>📋 Patient Nutrition Profile</h4>
              <form onSubmit={handleUpdateProfile}>
                <div>
                  <label>Sodium Limit (mg)</label>
                  <input
                    type="number"
                    name="sodium_limit_mg"
                    value={profileForm.sodium_limit_mg}
                    onChange={(e) => setProfileForm({...profileForm, sodium_limit_mg: e.target.value})}
                    placeholder="e.g., 1500"
                  />
                </div>
                <div>
                  <label>Fiber Target (g)</label>
                  <input
                    type="number"
                    name="fiber_target_g"
                    value={profileForm.fiber_target_g}
                    onChange={(e) => setProfileForm({...profileForm, fiber_target_g: e.target.value})}
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <label>Calorie Target (Maximum)</label>
                  <input
                    type="number"
                    name="calorie_target_max"
                    value={profileForm.calorie_target_max}
                    onChange={(e) => setProfileForm({...profileForm, calorie_target_max: e.target.value})}
                    placeholder="e.g., 1800"
                  />
                </div>
                <button type="submit" style={{ background: 'var(--blue)', color: 'white' }}>
                  💾 Update Profile
                </button>
              </form>
              
              <hr className="diet-divider" />
              
              <h4>🍽️ Log New Meal</h4>
              <form onSubmit={handleLogMeal}>
                <div>
                  <label>Meal Type</label>
                  <select
                    name="meal_type"
                    value={mealForm.meal_type}
                    onChange={(e) => setMealForm({...mealForm, meal_type: e.target.value})}
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">☀️ Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                    <option value="snack">🍪 Snack</option>
                  </select>
                </div>
                <div>
                  <label>Foods (separate with commas)</label>
                  <input
                    name="foods_consumed"
                    value={mealForm.foods_consumed}
                    onChange={(e) => setMealForm({...mealForm, foods_consumed: e.target.value})}
                    placeholder="e.g., oatmeal, apple, milk"
                  />
                </div>
                <div>
                  <label>Calories (kcal)</label>
                  <input
                    name="calories"
                    value={mealForm.calories}
                    onChange={(e) => setMealForm({...mealForm, calories: e.target.value})}
                    placeholder="e.g., 350"
                    type="number"
                  />
                </div>
                <div>
                  <label>Sodium (mg)</label>
                  <input
                    name="sodium_mg"
                    value={mealForm.sodium_mg}
                    onChange={(e) => setMealForm({...mealForm, sodium_mg: e.target.value})}
                    placeholder="e.g., 200"
                    type="number"
                  />
                </div>
                <div>
                  <label>Fiber (g)</label>
                  <input
                    name="fiber_g"
                    value={mealForm.fiber_g}
                    onChange={(e) => setMealForm({...mealForm, fiber_g: e.target.value})}
                    placeholder="e.g., 5"
                    type="number"
                  />
                </div>
                <button type="submit" style={{ background: 'var(--green)', color: 'white' }}>
                  ✏️ Log Meal
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Data & Plans */}
          <div>
            <div className="form-card">
              <h4>📅 Nutrition Profile Data</h4>
              {profile ? (
                <div style={{ fontSize: '13px' }}>
                  <div className="meal-item">
                    <p className="meal-time">Sodium Limit: <strong>{profile.sodium_limit_mg || '-'} mg</strong></p>
                    <p className="meal-time">Fiber Target: <strong>{profile.fiber_target_g || '-'} g</strong></p>
                    <p className="meal-time">Calorie Target: <strong>{profile.calorie_target_max || '-'} kcal</strong></p>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted-2)', textAlign: 'center', fontSize: '12px' }}>No nutrition profile available</p>
              )}
            </div>

            <div className="form-card">
              <h4>📝 Recorded Meal History</h4>
              <div className="meal-list">
                {meals.length > 0 ? meals.map((meal, idx) => (
                  <div key={meal.meal_log_id || idx} className="meal-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <p className="meal-time">{new Date(meal.logged_for || meal.created_at).toLocaleDateString()}: {meal.meal_type}</p>
                    <p className="meal-foods">🍽️ {Array.isArray(meal.foods) ? meal.foods.join(', ') : meal.foods}</p>
                    <div className="meal-nutrition">
                      <span>⚡ {meal.calories || 0} kcal</span>
                      <span>🧂 {meal.sodium_mg || 0}mg Na</span>
                      <span>🌾 {meal.fiber_g || 0}g Fiber</span>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: 'var(--color-muted-2)', textAlign: 'center', fontSize: '12px', padding: '20px 0' }}>
                    No meals recorded yet. Start logging now! 👇
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