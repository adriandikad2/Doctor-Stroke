import * as prescriptionRepository from '../repositories/prescription.repository.js';

/**
 * Add a new prescription (doctor only)
 * @param {object} prescriptionData - Prescription data
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The created prescription
 * @throws {Error} - If user is not a doctor
 */
export const addNewPrescription = async (prescriptionData, user) => {
  // Only doctors can create prescriptions
  if (user.role !== 'doctor') {
    throw new Error('Hanya dokter yang dapat membuat resep');
  }

  return prescriptionRepository.createPrescription({
    ...prescriptionData,
    doctor_user_id: user.user_id,
  });
};

/**
 * Get all prescriptions for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of prescriptions
 */
export const getPrescriptions = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID diperlukan');
  }
  return prescriptionRepository.findPrescriptionsByPatientId(patientId);
};

/**
 * Update a prescription (doctor only)
 * @param {string} prescriptionId - The prescription ID
 * @param {object} data - Updated prescription data
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The updated prescription
 * @throws {Error} - If user is not a doctor or prescription not found
 */
export const updatePrescription = async (prescriptionId, data, user) => {
  // Only doctors can update prescriptions
  if (user.role !== 'doctor') {
    throw new Error('Hanya dokter yang dapat mengubah resep');
  }

  // Check if prescription exists
  const prescription = await prescriptionRepository.findPrescriptionById(prescriptionId);
  if (!prescription) {
    throw new Error('Resep tidak ditemukan');
  }

  return prescriptionRepository.updatePrescription(prescriptionId, data);
};

/**
 * Delete a prescription (doctor only)
 * @param {string} prescriptionId - The prescription ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The deleted prescription
 * @throws {Error} - If user is not a doctor or prescription not found
 */
export const deletePrescription = async (prescriptionId, user) => {
  // Only doctors can delete prescriptions
  if (user.role !== 'doctor') {
    throw new Error('Hanya dokter yang dapat menghapus resep');
  }

  // Check if prescription exists
  const prescription = await prescriptionRepository.findPrescriptionById(prescriptionId);
  if (!prescription) {
    throw new Error('Resep tidak ditemukan');
  }

  return prescriptionRepository.deletePrescription(prescriptionId);
};

/**
 * Get all prescriptions (admin/testing endpoint)
 * @returns {Promise<array>} - Array of all prescriptions
 */
export const getAllPrescriptions = async () => {
  return prescriptionRepository.findAllPrescriptions();
};
