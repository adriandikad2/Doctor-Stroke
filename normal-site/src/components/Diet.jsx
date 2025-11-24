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

    const handlePatientChange = (e) => {
      const patientId = e.target.value;
      const patient = patients.find(p => p.patient_id === patientId);
      setSelectedPatient(patient || null);
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
                color: '#334155'
              }}>Select Patient</label>
              <select
                id="patient-select"
                value={selectedPatient?.patient_id || ''}
                onChange={handlePatientChange}
                style={{
                  width: '100%',
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
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#334155' }}>Recent Meal History</h3>
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