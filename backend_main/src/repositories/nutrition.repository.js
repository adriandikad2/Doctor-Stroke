import prisma from '../config/db.js';

/**
 * Upsert a nutrition profile (create if not exists, update if it does)
 * @param {string} patientId - The patient ID
 * @param {object} data - Nutrition profile data
 * @returns {Promise<object>} - The created or updated nutrition profile
 */
export const upsertNutritionProfile = async (patientId, data) => {
  return prisma.nutrition_profiles.upsert({
    where: { patient_id: patientId },
    update: { ...data },
    create: {
      patient_id: patientId,
      ...data,
    },
    include: {
      patient: true,
      updated_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
        },
      },
    },
  });
};

/**
 * Find a nutrition profile by patient ID
 * @param {string} patientId - The patient ID
 * @returns {Promise<object|null>} - The nutrition profile or null if not found
 */
export const findNutritionProfile = async (patientId) => {
  return prisma.nutrition_profiles.findUnique({
    where: { patient_id: patientId },
    include: {
      patient: true,
      updated_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
        },
      },
    },
  });
};

/**
 * Find all nutrition profiles
 * @returns {Promise<array>} - Array of all nutrition profiles
 */
export const findAllNutritionProfiles = async () => {
  return prisma.nutrition_profiles.findMany({
    include: {
      patient: true,
      updated_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
        },
      },
    },
  });
};

/**
 * Find meals logged for a specific date for a patient
 * @param {string} patientId - Patient ID
 * @param {Date} date - Date of the meal logs
 * @returns {Promise<array>} 
 */
export const findMealLogsByDate = async (patientId, date) => {
  // Find meals logged for a specific day 
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return prisma.meal_logs.findMany({
    where: {
      patient_id: patientId,
      logged_for: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      meal_type: true,
      foods: true,
      sodium_mg: true,
      calories: true,
      fiber_g: true,
    },
  });
};
