import * as nutritionRepository from '../repositories/nutrition.repository.js';
import * as logRepository from '../repositories/log.repository.js'; 
/**
 * Get nutrition profile for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<object|null>} - The nutrition profile or null if not found
 */
export const getProfile = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID diperlukan');
  }
  return nutritionRepository.findNutritionProfile(patientId);
};

/**
 * Update or create nutrition profile (doctor/therapist only)
 * @param {string} patientId - The patient ID
 * @param {object} data - Nutrition profile data
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The created or updated nutrition profile
 * @throws {Error} - If user is not a doctor or therapist
 */
export const updateProfile = async (patientId, data, user) => {
  // Only doctors and therapists can manage nutrition profiles
  if (user.role === 'family') {
    throw new Error('Hanya dokter/terapis yang dapat mengatur nutrisi');
  }

  if (!patientId) {
    throw new Error('Patient ID diperlukan');
  }

  // Add the user who updated the profile
  const updateData = {
    ...data,
    updated_by_user_id: user.user_id,
  };

  return nutritionRepository.upsertNutritionProfile(patientId, updateData);
};

/**
 * Get all nutrition profiles (for admin/doctor dashboard)
 * @returns {Promise<array>} - Array of all nutrition profiles
 */
export const getAllProfiles = async () => {
  return nutritionRepository.findAllNutritionProfiles();
};

/**
 * Get all nutrition profiles (admin/testing endpoint - alias)
 * @returns {Promise<array>} - Array of all nutrition profiles
 */
export const getAllNutritionProfiles = async () => {
  return nutritionRepository.findAllNutritionProfiles();
};

/**
 * Get feedback on today's logged meals compared to the patient's targets.
 * @param {string} patientId - The patient ID
 * @returns {Promise<object>} - Object containing summary and feedback
 * @throws {Error} - If patient ID or nutrition profile not found
 */
export const getMealFeedback = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID diperlukan');
  }

  const profile = await nutritionRepository.findNutritionProfile(patientId);
  if (!profile) {
    throw new Error('Nutrition profile for patient not found');
  }

  // Use today's date for current logging/feedback
  const today = new Date();
  const todayMeals = await logRepository.findMealLogs(patientId);
  
  // Filter meals to only include today's logs 
  const todayMealsFiltered = todayMeals.filter(meal => {
      const mealDate = new Date(meal.logged_for);
      return mealDate.toDateString() === today.toDateString();
  });


  if (todayMealsFiltered.length === 0) {
    return {
      summary: 'There are no meals logged for today',
      feedback: 'Please log meals to receive feedback',
      goals: profile,
      totals: {
        sodium_mg: 0,
        calories: 0,
        fiber_g: 0
      }
    };
  }

  // Calculate total nutrients for today
  const totalNutrients = todayMealsFiltered.reduce((totals, meal) => {
    totals.sodium_mg += meal.sodium_mg;
    totals.calories += meal.calories;
    totals.fiber_g += meal.fiber_g;
    return totals;
  }, { sodium_mg: 0, calories: 0, fiber_g: 0 });

  let feedbackMessages = [];
  
  // 1. Sodium Feedback
  if (totalNutrients.sodium_mg > profile.sodium_limit_mg) {
    feedbackMessages.push(`⚠️ SODIUM Consumed: Total Sodium Intake (${totalNutrients.sodium_mg}mg) exceeding the recommended limit (${profile.sodium_limit_mg}mg).`);
  } else if (totalNutrients.sodium_mg >= profile.sodium_limit_mg * 0.8) {
    feedbackMessages.push(`🔔 Sodium is approaching the limit (${totalNutrients.sodium_mg}mg) Be careful with your next sodium intake`);
  } else {
    feedbackMessages.push(`✅ The amount of sodium is well-controlled (${totalNutrients.sodium_mg}mg from the limit ${profile.sodium_limit_mg}mg).`);
  }

  // 2. Calorie Feedback (Range)
  if (totalNutrients.calories < profile.calorie_target_min) {
    feedbackMessages.push(`⚠️ CALORIE Consumed: Total calorie Intake (${totalNutrients.calories}) still below the minimum target limit (${profile.calorie_target_min}).`);
  } else if (totalNutrients.calories > profile.calorie_target_max) {
    feedbackMessages.push(`⚠️ CALORIE Consumed: Total calories (${totalNutrients.calories}) exceeding the recommended limit (${profile.calorie_target_max}).`);
  } else {
    feedbackMessages.push(`✅ The calories in the target range (${profile.calorie_target_min} - ${profile.calorie_target_max}).`);
  }

  // 3. Fiber Feedback (Target)
  if (totalNutrients.fiber_g < profile.fiber_target_g) {
    feedbackMessages.push(`⚠️ FIBER Target: Fiber Intake (${totalNutrients.fiber_g}g) still below the recommended target limit (${profile.fiber_target_g}g). Add vegetables or grains rich in fiber`);
  } else {
    feedbackMessages.push(`✅ Fiber target achieved (${totalNutrients.fiber_g}g). Great job!`);
  }

  return {
    summary: 'Meal feedback for today',
    feedback: feedbackMessages.join('\n'),
    goals: profile,
    totals: totalNutrients
  };
};