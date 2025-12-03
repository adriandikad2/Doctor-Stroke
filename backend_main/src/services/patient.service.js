import prisma from '../config/db.js';
import * as patientRepository from '../repositories/patient.repository.js';

/**
 * Create a new patient profile and auto-link the family user
 * @param {object} patientData - Patient data (name, date_of_birth, etc.)
 * @param {object} user - Authenticated user object { user_id, role }
 * @returns {Promise<object>} - The created patient profile with care team
 * @throws {Error} - If user is not a 'family' role
 */
export const createNewPatient = async (patientData, user) => {
  // Role validation: only 'family' users can create patients
  if (user.role !== 'family') {
    throw new Error('Only family members can create patient profiles');
  }

  // Generate unique code in format PASIEN-XXXXXX (6 alphanumeric characters)
  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PASIEN-${code}`;
  };

  // Generate unique code and ensure it's unique
  let unique_code = generateUniqueCode();
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    const existing = await patientRepository.findPatientByCode(unique_code);
    if (!existing) {
      isUnique = true;
    } else {
      unique_code = generateUniqueCode();
      attempts++;
    }
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique patient code');
  }

  // Execute transaction: create patient and auto-link family user
  const newPatient = await prisma.$transaction(async (tx) => {
    // Create the patient profile
    const patient = await patientRepository.createPatientProfile(
      {
        ...patientData,
        // FIX: Convert the string to a Date object here
        date_of_birth: new Date(patientData.date_of_birth),
        
        // FIX 2: Convert Gender to Uppercase (male -> MALE)
        // This ensures it matches the 'gender_enum' in your database
        gender: patientData.gender ? patientData.gender.toUpperCase() : undefined,

        unique_code,
      },
      tx
    );

    // Auto-link the family user to the patient
    await patientRepository.linkUserToPatient(user.user_id, patient.patient_id, tx);

    return patient;
  });

  return newPatient;
};

/**
 * Link a medical team member (doctor/therapist) to an existing patient
 * @param {string} uniqueCode - The patient's unique code
 * @param {object} user - Authenticated user object { user_id, role }
 * @returns {Promise<object>} - The patient profile with updated care team
 * @throws {Error} - If user is 'family', patient not found, or invalid role
 */
export const linkMedicalTeamToPatient = async (uniqueCode, user) => {
  // Role validation: only 'doctor' or 'therapist' can link
  if (user.role === 'family') {
    throw new Error('Family members cannot link themselves using a patient code');
  }

  // Find patient by unique code
  const patient = await patientRepository.findPatientByCode(uniqueCode);
  if (!patient) {
    throw new Error('Patient not found with the provided code');
  }

  // Execute transaction: link the user to the patient
  await prisma.$transaction(async (tx) => {
    await patientRepository.linkUserToPatient(user.user_id, patient.patient_id, tx);
  });

  // Return the updated patient with care team
  return patientRepository.findPatientById(patient.patient_id);
};

/**
 * Get all patients linked to a user (Dashboard)
 * @param {string} userId - The user's ID
 * @returns {Promise<array>} - Array of patient profiles linked to the user
 */
export const getMyPatients = async (userId) => {
  return patientRepository.findPatientsByUserId(userId);
};

/**
 * Get patient details by ID (with access control)
 * @param {string} patientId - The patient ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The patient profile
 * @throws {Error} - If user is not linked to the patient or patient not found
 */
export const getPatientDetails = async (patientId, user) => {
  // Security check: User must be linked to the patient
  const isLinked = await patientRepository.isUserLinkedToPatient(
    user.user_id,
    patientId
  );

  if (!isLinked) {
    throw new Error('Anda tidak memiliki akses ke pasien ini');
  }

  const patient = await patientRepository.findPatientById(patientId);
  if (!patient) {
    throw new Error('Pasien tidak ditemukan');
  }

  return patient;
};

/**
 * Update patient profile (family admin only)
 * @param {string} patientId - The patient ID
 * @param {object} data - Updated patient data
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The updated patient profile
 * @throws {Error} - If user is not 'family' or patient not found
 */
export const updatePatientDetails = async (patientId, data, user) => {
  // Role validation: only 'family' can update patient profiles
  if (user.role !== 'family') {
    throw new Error('Hanya anggota keluarga yang dapat memperbarui profil pasien');
  }

  // Security check: User must be linked to the patient
  const isLinked = await patientRepository.isUserLinkedToPatient(
    user.user_id,
    patientId
  );

  if (!isLinked) {
    throw new Error('Anda tidak memiliki akses ke pasien ini');
  }

  return patientRepository.updatePatient(patientId, data);
};

/**
 * Delete patient profile (family admin only)
 * @param {string} patientId - The patient ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The deleted patient profile
 * @throws {Error} - If user is not 'family' or patient not found
 */
export const deletePatientProfile = async (patientId, user) => {
  // Role validation: only 'family' can delete patient profiles
  if (user.role !== 'family') {
    throw new Error('Hanya anggota keluarga yang dapat menghapus profil pasien');
  }

  // Security check: User must be linked to the patient
  const isLinked = await patientRepository.isUserLinkedToPatient(
    user.user_id,
    patientId
  );

  if (!isLinked) {
    throw new Error('Anda tidak memiliki akses ke pasien ini');
  }

  return patientRepository.deletePatient(patientId);
};

/**
 * Get all patient profiles (admin/testing endpoint)
 * @returns {Promise<array>} - Array of all patient profiles
 */
export const getAllPatientProfiles = async () => {
  return patientRepository.findAllPatientProfiles();
};
