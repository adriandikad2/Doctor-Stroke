import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Diet = () => {
  const { authToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [error, setError] = useState('');
  const [patientSelectorLoading, setPatientSelectorLoading] = useState(false);
  
  // Daily tracker state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyMeals, setDailyMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  const [foodInputs, setFoodInputs] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
    snack: ''
  });
 const [showDailyTracker, setShowDailyTracker] = useState(false);

  useEffect(() => {
    if (authToken) {
      loadPatients();
    }
  }, [authToken]);

  const loadPatients = async () => {
    try {
      setPatientSelectorLoading(true);
      setError('');
      
      const response = await fetch('/api/patients/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPatients(data.data || []);
        if (data.data && data.data.length > 0) {
          // Auto-select first patient
          setSelectedPatient(data.data[0]);
        }
      } else {
        setError(data.message || 'Failed to load patients');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setPatientSelectorLoading(false);
    }
 };

  const loadPatientData = async (patientId) => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Load nutrition profile and meal logs in parallel
      const [nutritionResponse, mealsResponse] = await Promise.all([
        fetch(`/api/nutrition/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/logs/meal/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      const nutritionData = await nutritionResponse.json();
      const mealsData = await mealsResponse.json();
      
      if (nutritionResponse.ok) {
        setNutritionProfile(nutritionData.data);
      } else {
        setNutritionProfile(null);
      }
      
      if (mealsResponse.ok) {
        setMealLogs(mealsData.data || []);
      } else {
        setMealLogs([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      loadPatientData(selectedPatient.patient_id);
    }
 }, [selectedPatient, authToken]);
  
  // Load daily meals when patient or date changes
  useEffect(() => {
    loadDailyMeals();
  }, [selectedPatient, currentDate, authToken]);

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.patient_id === patientId);
    setSelectedPatient(patient || null);
  };
  
  // Function to navigate to previous/next day
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  // Function to check if food item is available in the system
  const checkFoodAvailability = async (foodName) => {
    try {
      const response = await fetch(`/api/nutrition/food/check?name=${encodeURIComponent(foodName)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('Error checking food availability:', error);
      return false; // Assume unavailable if there's an error
    }
  };
  
  // Function to save food entry to backend
  const saveFoodEntry = async (mealType, foodItem) => {
    try {
      const response = await fetch('/api/logs/meal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: selectedPatient.patient_id,
          meal_type: mealType,
          foods: [foodItem.name],
          logged_for: currentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          is_available: foodItem.isAvailable
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to save food entry:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving food entry:', error);
    }
  };
  
  // Function to load daily meals from backend
  const loadDailyMeals = async () => {
    if (!selectedPatient || !authToken) return;
    
    try {
      const response = await fetch(`/api/logs/meal/${selectedPatient.patient_id}?date=${currentDate.toISOString().split('T')[0]}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        // Group meals by type
        const mealsByType = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        };
        
        data.data.forEach(meal => {
          if (mealsByType.hasOwnProperty(meal.meal_type)) {
            meal.foods.forEach((food, index) => {
              mealsByType[meal.meal_type].push({
                id: `${meal.log_id}-${index}`,
                name: food,
                isAvailable: meal.is_available,
                timestamp: meal.created_at
              });
            });
          }
        });
        
        setDailyMeals(mealsByType);
      }
    } catch (error) {
      console.error('Error loading daily meals:', error);
    }
 };
  
  // Function to handle adding food to a meal
  const handleAddFood = async (mealType) => {
    const foodItem = foodInputs[mealType]?.trim();
    if (!foodItem) return;
    
    // Check if food item is available in the system
    const isFoodAvailable = await checkFoodAvailability(foodItem);
    
    const newFoodItem = {
      id: Date.now(),
      name: foodItem,
      isAvailable: isFoodAvailable,
      timestamp: new Date().toISOString()
    };
    
    setDailyMeals(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], newFoodItem]
    }));
    
    setFoodInputs(prev => ({
      ...prev,
      [mealType]: ''
    }));
    
    // Save to backend
    if (selectedPatient && authToken) {
      await saveFoodEntry(mealType, newFoodItem);
    }
  };
  
  // Function to handle removing food from a meal
  const handleRemoveFood = (mealType, foodId) => {
    setDailyMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter(food => food.id !== foodId)
    }));
  };
  
  // Function to handle food input change
  const handleFoodInputChange = (mealType, value) => {
    setFoodInputs(prev => ({
      ...prev,
      [mealType]: value
    }));
  };

  if (patientSelectorLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '500px',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #8385CC',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#64748b' }}>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diet-page" style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      <style>{`
        .daily-tracker {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          margin-bottom: 24px;
        }
        
        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .date-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .date-nav {
          background: #8385CC;
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .meals-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .meal-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }
        
        .meal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .food-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        
        .add-food-btn {
          background: #8385CC;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          margin-bottom: 12px;
        }
        
        .food-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .remove-food {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          margin: '0',
          fontSize: '28px',
          fontWeight: '700',
          color: '#8385CC'
        }}>🥗 My Diet & Nutrition</h1>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          marginBottom: '24px'
        }}>
          ❌ {error}
        </div>
      )}

      {patients.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px'
          }}>👋</div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#334155'
          }}>No patients found</h3>
          <p style={{
            margin: '0',
            color: '#64748b',
            fontSize: '14px'
          }}>
            Ask your doctor to add you to a patient's care team.
          </p>
        </div>
      ) : (
        <div>
          {/* Patient Selector */}
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <label htmlFor="patient-select" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#33415'
            }}>Select Patient</label>
            <select
              id="patient-select"
              value={selectedPatient?.patient_id || ''}
              onChange={handlePatientChange}
              style={{
                width: '10%',
                padding: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              {patients.map(patient => (
                <option key={patient.patient_id} value={patient.patient_id}>
                    {patient.name} (ID: {patient.unique_code})
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div>
              {loading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '40px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div className="spinner" style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #e2e8f0',
                      borderTop: '4px solid #8385CC',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#64748b' }}>Loading nutrition data...</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '24px' }}>
                  {/* Daily Diet Tracker */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <h2 style={{
                        margin: '0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span>🗓️</span> Daily Food Tracker
                      </h2>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <button
                          onClick={goToPreviousDay}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#8385CC',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          ← Prev Day
                        </button>
                        <span style={{
                          fontWeight: '500',
                          color: '#334155',
                          minWidth: '200px',
                          textAlign: 'center'
                        }}>
                          {currentDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <button
                          onClick={goToNextDay}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#8385CC',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Next Day →
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '20px'
                    }}>
                      {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                        <div key={mealType} style={{
                          padding: '16px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px'
                          }}>
                            <span>{getMealTypeEmoji(mealType)}</span>
                            <strong style={{
                              color: '#334155',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}>
                              {formatMealType(mealType)}
                            </strong>
                          </div>
                          
                          <div style={{ marginBottom: '12px' }}>
                            <input
                              type="text"
                              value={foodInputs[mealType]}
                              onChange={(e) => handleFoodInputChange(mealType, e.target.value)}
                              placeholder={`Add food for ${mealType}...`}
                              style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '14px'
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddFood(mealType);
                                }
                              }}
                            />
                            
                            <button
                              onClick={() => handleAddFood(mealType)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                backgroundColor: '#8385CC',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginTop: '8px'
                              }}
                            >
                              ➕ Add Food Item
                            </button>
                          </div>
                          
                          <div>
                            <p style={{
                              margin: '0 0 8px 0',
                              fontWeight: '500',
                              color: '#334155',
                              fontSize: '14px'
                            }}>
                              Foods Eaten:
                            </p>
                            {dailyMeals[mealType].length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {dailyMeals[mealType].map(food => (
                                  <div key={food.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ color: '#334155' }}>{food.name}</span>
                                      {!food.isAvailable && (
                                        <span title="Food not in database - consult your doctor" style={{ color: '#f59e0b', fontSize: '12px' }}>⚠️</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleRemoveFood(mealType, food.id)}
                                      style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{
                                color: '#94a3b8',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                padding: '12px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '6px'
                              }}>
                                No foods added yet
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '24px' }}>
                    {/* Nutrition Profile */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h2 style={{
                        margin: '0 0 20px 0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span>📋</span> Nutrition Profile
                      </h2>
                      
                      {nutritionProfile ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Calorie Target</p>
                            <p style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#8385CC' }}>
                              {nutritionProfile.calorie_target_min || 0} - {nutritionProfile.calorie_target_max || 0} kcal
                            </p>
                          </div>
                          
                          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Sodium Limit</p>
                            <p style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#8385CC' }}>
                              {nutritionProfile.sodium_limit_mg || 0} mg
                            </p>
                          </div>
                          
                          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Fiber Target</p>
                            <p style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#8385CC' }}>
                              {nutritionProfile.fiber_target_g || 0} g
                            </p>
                          </div>
                          
                          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Fluid Limit</p>
                            <p style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#8385CC' }}>
                              {nutritionProfile.fluid_limit_ml || 0} ml
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                          No nutrition profile set for this patient.
                        </p>
                      )}
                    </div>

                    {/* Dietary Guidelines & Meal History */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h2 style={{
                        margin: '0 0 20px 0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span>📋</span> Dietary Guidelines & History
                      </h2>
                      
                      {/* Dietary Guidelines */}
                      <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#334155' }}>Recommended Dietary Guidelines</h3>
                        {nutritionProfile ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Daily Calorie Target</p>
                              <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#8385CC' }}>
                                {nutritionProfile.calorie_target_min || 0} - {nutritionProfile.calorie_target_max || 0} kcal
                              </p>
                            </div>
                            
                            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Sodium Limit</p>
                              <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#8385CC' }}>
                                {nutritionProfile.sodium_limit_mg || 0} mg
                              </p>
                            </div>
                            
                            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Fiber Target</p>
                              <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#8385CC' }}>
                                {nutritionProfile.fiber_target_g || 0} g
                              </p>
                            </div>
                            
                            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Fluid Limit</p>
                              <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#8385CC' }}>
                                {nutritionProfile.fluid_limit_ml || 0} ml
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p style={{ color: '#64748b', textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            No specific dietary guidelines set for this patient.
                          </p>
                        )}
                      </div>
                      
                      {/* Meal History */}
                      <div>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#33415' }}>Recent Meal History</h3>
                        {mealLogs.length > 0 ? (
                          <div style={{ display: 'grid', gap: '16px' }}>
                            {mealLogs.slice(0, 5).map((meal, index) => (
                              <div key={index} style={{
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '8px'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{getMealTypeEmoji(meal.meal_type)}</span>
                                    <strong style={{ color: '#334155' }}>{formatMealType(meal.meal_type)}</strong>
                                  </div>
                                  <span style={{ color: '#64748b', fontSize: '12px' }}>
                                    {new Date(meal.logged_for).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <div style={{ marginBottom: '12px' }}>
                                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Foods Consumed</p>
                                  <p style={{ margin: '0', color: '#334155' }}>
                                    {meal.foods?.join(', ') || 'No food items recorded'}
                                  </p>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                                  <div>
                                    <p style={{ margin: '0 0 2px 0', fontSize: '10px', color: '#64748b' }}>Calories</p>
                                    <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                      {meal.calories || 0} kcal
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p style={{ margin: '0 0 2px 0', fontSize: '10px', color: '#64748b' }}>Sodium</p>
                                    <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                      {meal.sodium_mg || 0} mg
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p style={{ margin: '0 0 2px 0', fontSize: '10px', color: '#64748b' }}>Fiber</p>
                                    <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                      {meal.fiber_g || 0} g
                                    </p>
                                  </div>
                                </div>
                                
                                {meal.feedback && meal.feedback.status === 'warning' && (
                                  <div style={{
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    backgroundColor: '#fef3c7',
                                    border: '1px solid #f59e0b',
                                    borderRadius: '6px',
                                    color: '#92400e'
                                  }}>
                                    <strong style={{ fontSize: '12px' }}>⚠️ Feedback:</strong> {meal.feedback.notes?.join(', ') || ''}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                            No meal logs recorded for this patient yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper functions
function getMealTypeEmoji(type) {
  const map = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍪'
  };
 return map[type] || '🍽️';
}

function formatMealType(type) {
  const map = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack'
  };
  return map[type] || type;
}

export default Diet;