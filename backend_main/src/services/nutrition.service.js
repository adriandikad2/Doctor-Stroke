import * as nutritionRepository from '../repositories/nutrition.repository.js';

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
