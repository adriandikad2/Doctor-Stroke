import prisma from '../config/db.js';

/**
 * Create a new patient profile (must be called within a transaction)
 * @param {object} patientData - Patient data including name, date_of_birth, unique_code, etc.
 * @param {object} tx - The transaction object
 * @returns {Promise<object>} - The created patient profile
 */
export const createPatientProfile = async (patientData, tx) => {
  return tx.patient_profiles.create({
    data: patientData,
  });
};

/**
 * Link a user to a patient in the care team (must be called within a transaction)
 * @param {string} userId - The user's ID
 * @param {string} patientId - The patient's ID
 * @param {object} tx - The transaction object
 * @returns {Promise<object>} - The created care team link
 */
export const linkUserToPatient = async (userId, patientId, tx) => {
  return tx.patient_care_team.create({
    data: {
      user_id: userId,
      patient_id: patientId,
    },
  });
};

/**
 * Find a patient by their unique code
 * @param {string} uniqueCode - The patient's unique code
 * @returns {Promise<object|null>} - The patient profile or null if not found
 */
export const findPatientByCode = async (uniqueCode) => {
  return prisma.patient_profiles.findUnique({
    where: { unique_code: uniqueCode },
    include: {
      care_team_links: {
        include: {
          user: {
            include: {
              doctor_profile: true,
              therapist_profile: true,
              family_profile: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Find all patients linked to a user (Dashboard query)
 * @param {string} userId - The user's ID
 * @returns {Promise<array>} - Array of patient profiles linked to the user
 */
export const findPatientsByUserId = async (userId) => {
  return prisma.patient_profiles.findMany({
    where: {
      care_team_links: {
        some: {
          user_id: userId,
        },
      },
    },
    include: {
      care_team_links: {
        include: {
          user: {
            include: {
              doctor_profile: true,
              therapist_profile: true,
              family_profile: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Find a patient by ID with full care team details
 * @param {string} patientId - The patient's ID
 * @returns {Promise<object|null>} - The patient profile or null if not found
 */
export const findPatientById = async (patientId) => {
  return prisma.patient_profiles.findUnique({
    where: { patient_id: patientId },
    include: {
      care_team_links: {
        include: {
          user: {
            include: {
              doctor_profile: true,
              therapist_profile: true,
              family_profile: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Check if a user is linked to a patient
 * @param {string} userId - The user ID
 * @param {string} patientId - The patient ID
 * @returns {Promise<boolean>} - True if linked, false otherwise
 */
export const isUserLinkedToPatient = async (userId, patientId) => {
  const link = await prisma.patient_care_team.findFirst({
    where: {
      user_id: userId,
      patient_id: patientId,
    },
  });
  return !!link;
};

/**
 * Update a patient profile
 * @param {string} patientId - The patient ID
 * @param {object} data - Updated patient data
 * @returns {Promise<object>} - The updated patient profile
 * @throws {Error} - If patient not found
 */
export const updatePatient = async (patientId, data) => {
  return prisma.patient_profiles.update({
    where: { patient_id: patientId },
    data,
    include: {
      care_team_links: {
        include: {
          user: {
            include: {
              doctor_profile: true,
              therapist_profile: true,
              family_profile: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Delete a patient profile (cascades to care_team_links)
 * @param {string} patientId - The patient ID
 * @returns {Promise<object>} - The deleted patient profile
 * @throws {Error} - If patient not found
 */
export const deletePatient = async (patientId) => {
  return prisma.patient_profiles.delete({
    where: { patient_id: patientId },
    include: {
      care_team_links: true,
    },
  });
};

/**
 * Find all patient profiles
 * @returns {Promise<array>} - Array of all patient profiles with care teams
 */
export const findAllPatientProfiles = async () => {
  return prisma.patient_profiles.findMany({
    include: {
      care_team_links: {
        include: {
          user: {
            include: {
              doctor_profile: true,
              therapist_profile: true,
              family_profile: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};
