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
      doctor: { 
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
      doctor: { 
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
      doctor: { 
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
      doctor: { 
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
      doctor: { 
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
      doctor: { 
        include: {
          doctor_profile: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Find an active prescription by medication name and patient ID
 * @param {string} patientId - The patient ID
 * @param {string} medicationName - The medication name
 * @returns {Promise<object|null>} - The active prescription or null if not found
 */
export const findActivePrescription = async (patientId, medicationName) => {
  return prisma.prescriptions.findFirst({
    where: {
      patient_id: patientId,
      medication_name: {
        equals: medicationName,
        mode: 'insensitive', 
      },
      is_active: true,
      OR: [
        { end_date: null }, 
        { end_date: { gte: new Date() } }, 
      ],
    },
    select: {
      prescription_id: true,
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Find all active prescriptions for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of active prescriptions for the patient
 */
export const findActivePrescriptions = async (patientId) => {
  return prisma.prescriptions.findMany({
    where: {
      patient_id: patientId,
      is_active: true,
      OR: [
        { end_date: null },
        { end_date: { gte: new Date() } },
      ],
    },
    include: {
      patient: true,
      doctor: {
        include: {
          doctor_profile: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Find medication interaction between two medications
 * @param {string} medA - First medication name
 * @param {string} medB - Second medication name
 * @returns {Promise<object|null>} - The interaction record if found, null otherwise
 */
export const findInteraction = async (medA, medB) => {
  return prisma.medication_interactions.findFirst({
    where: {
      OR: [
        {
          medication_a: {
            equals: medA,
            mode: 'insensitive',
          },
          medication_b: {
            equals: medB,
            mode: 'insensitive',
          },
        },
        {
          medication_a: {
            equals: medB,
            mode: 'insensitive',
          },
          medication_b: {
            equals: medA,
            mode: 'insensitive',
          },
        },
      ],
    },
  });
};