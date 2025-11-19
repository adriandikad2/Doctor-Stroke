import * as careTeamRepository from '../repositories/care_team.repository.js';
import * as patientRepository from '../repositories/patient.repository.js';

/**
 * Get the care team for a patient (with access control)
 * @param {string} patientId - The patient ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<array>} - Array of care team members
 * @throws {Error} - If user is not authorized to view the team
 */
export const getTeamForPatient = async (patientId, user) => {
  if (!patientId) {
    throw new Error('Patient ID diperlukan');
  }

  // Check if user is linked to this patient
  const isLinked = await patientRepository.isUserLinkedToPatient(user.user_id, patientId);
  if (!isLinked) {
    throw new Error('Anda tidak memiliki akses ke pasien ini');
  }

  return careTeamRepository.findTeamByPatientId(patientId);
};

/**
 * Remove a member from a patient's care team (with access control)
 * @param {string} linkId - The care team link ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The removed care team link
 * @throws {Error} - If user is not authorized to remove the member
 */
export const removeMember = async (linkId, user) => {
  if (!linkId) {
    throw new Error('Link ID diperlukan');
  }

  // Get the link details
  const link = await careTeamRepository.findLink(linkId);
  if (!link) {
    throw new Error('Anggota tim tidak ditemukan');
  }

  // Security: Check if the user is removing themselves OR if they are the family admin
  const isRemovingSelf = user.user_id === link.user_id;
  const isFamilyAdmin = user.role === 'family';

  if (!isRemovingSelf && !isFamilyAdmin) {
    throw new Error('Anda tidak memiliki izin untuk menghapus anggota tim');
  }

  return careTeamRepository.deleteLink(linkId);
};

/**
 * Get all care team links (admin/testing endpoint)
 * @returns {Promise<array>} - Array of all care team links
 */
export const getAllCareTeamLinks = async () => {
  return careTeamRepository.findAllLinks();
};
