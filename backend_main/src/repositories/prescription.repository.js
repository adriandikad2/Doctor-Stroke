import prisma from '../config/db.js';

/**
 * Create a new prescription
 * @param {object} data - Prescription data { patient_id, doctor_user_id, medication_name, dosage, frequency, duration, instructions }
 * @returns {Promise<object>} - The created prescription
 */
export const createPrescription = async (data) => {
  return prisma.prescriptions.create({
    data,
    include: {
      patient: true,
      doctor_user: {
        include: {
          doctor_profile: true,
        },
      },
    },
  });
};

/**
 * Find all prescriptions for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of prescriptions for the patient
 */
export const findPrescriptionsByPatientId = async (patientId) => {
  return prisma.prescriptions.findMany({
    where: { patient_id: patientId },
    include: {
      patient: true,
      doctor_user: {
        include: {
          doctor_profile: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Find a prescription by ID
 * @param {string} prescriptionId - The prescription ID
 * @returns {Promise<object|null>} - The prescription or null if not found
 */
export const findPrescriptionById = async (prescriptionId) => {
  return prisma.prescriptions.findUnique({
    where: { prescription_id: prescriptionId },
    include: {
      patient: true,
      doctor_user: {
        include: {
          doctor_profile: true,
        },
      },
    },
  });
};

/**
 * Update a prescription
 * @param {string} prescriptionId - The prescription ID
 * @param {object} data - Updated prescription data
 * @returns {Promise<object>} - The updated prescription
 * @throws {Error} - If prescription not found
 */
export const updatePrescription = async (prescriptionId, data) => {
  return prisma.prescriptions.update({
    where: { prescription_id: prescriptionId },
    data,
    include: {
      patient: true,
      doctor_user: {
        include: {
          doctor_profile: true,
        },
      },
    },
  });
};

/**
 * Delete a prescription
 * @param {string} prescriptionId - The prescription ID
 * @returns {Promise<object>} - The deleted prescription
 * @throws {Error} - If prescription not found
 */
export const deletePrescription = async (prescriptionId) => {
  return prisma.prescriptions.delete({
    where: { prescription_id: prescriptionId },
    include: {
      patient: true,
      doctor_user: {
        include: {
          doctor_profile: true,
        },
      },
    },
  });
};

/**
 * Find all prescriptions
 * @returns {Promise<array>} - Array of all prescriptions
 */
export const findAllPrescriptions = async () => {
  return prisma.prescriptions.findMany({
    include: {
      patient: true,
      doctor_user: {
        include: {
          doctor_profile: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};
