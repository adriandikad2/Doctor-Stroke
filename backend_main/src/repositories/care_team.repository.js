import prisma from '../config/db.js';

/**
 * Find all team members linked to a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of care team members with full user profiles
 */
export const findTeamByPatientId = async (patientId) => {
  return prisma.patient_care_team.findMany({
    where: { patient_id: patientId },
    include: {
      user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
      patient: true,
    },
  });
};

/**
 * Find a specific care team link
 * @param {string} linkId - The link ID
 * @returns {Promise<object|null>} - The care team link or null if not found
 */
export const findLink = async (linkId) => {
  return prisma.patient_care_team.findUnique({
    where: { link_id: linkId },
    include: {
      user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
      patient: true,
    },
  });
};

/**
 * Remove a user from a patient's care team
 * @param {string} linkId - The link ID to delete
 * @returns {Promise<object>} - The deleted care team link
 * @throws {Error} - If link not found
 */
export const deleteLink = async (linkId) => {
  return prisma.patient_care_team.delete({
    where: { link_id: linkId },
    include: {
      user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
      patient: true,
    },
  });
};

/**
 * Find all care team links
 * @returns {Promise<array>} - Array of all care team links with user and patient details
 */
export const findAllLinks = async () => {
  return prisma.patient_care_team.findMany({
    include: {
      user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
      patient: true,
    },
    orderBy: { created_at: 'desc' },
  });
};
