import prisma from '../config/db.js';

/**
 * Create a doctor profile (must be called within a transaction)
 * @param {object} profileData - Profile data
 * @param {object} tx - The transaction object
 * @returns {Promise<object>} - The created doctor profile
 */
export const createDoctorProfile = async (profileData, tx) => {
  return tx.doctor_profiles.create({
    data: profileData,
  });
};

/**
 * Create a therapist profile (must be called within a transaction)
 * @param {object} profileData - Profile data
 * @param {object} tx - The transaction object
 * @returns {Promise<object>} - The created therapist profile
 */
export const createTherapistProfile = async (profileData, tx) => {
  return tx.therapist_profiles.create({
    data: profileData,
  });
};

/**
 * Create a family profile (must be called within a transaction)
 * @param {object} profileData - Profile data
 * @param {object} tx - The transaction object
 * @returns {Promise<object>} - The created family profile
 */
export const createFamilyProfile = async (profileData, tx) => {
  return tx.family_profiles.create({
    data: profileData,
  });
};
