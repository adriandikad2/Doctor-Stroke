import * as logRepository from '../repositories/log.repository.js';
import * as prescriptionRepository from '../repositories/prescription.repository.js';

/**
 * Add a new progress log entry
 * @param {object} data - Log data { patient_id, log_text }
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The created progress log
 */
export const addProgressLog = async (data, user) => {
  if (!data.patient_id || !data.log_text) {
    throw new Error('patient_id dan log_text diperlukan');
  }

  // Determine author role (family vs medical)
  const author_role = user.role === 'family' ? 'family' : 'medical';

  return logRepository.createProgressLog({
    ...data,
    author_user_id: user.user_id,
    author_role,
  });
};

/**
 * Get all progress logs for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of progress logs
 */
export const getProgressLogs = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID diperlukan');
  }
  return logRepository.findProgressLogs(patientId);
};

/**
 * Add a new meal log entry
 * @param {object} data - Meal log data { patient_id, logged_for, meal_type, food_items }
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The created meal log
 */
export const addMealLog = async (data, user) => {
  if (!data.patient_id || !data.logged_for || !data.meal_type) {
    throw new Error('patient_id, logged_for, dan meal_type diperlukan');
  }

  return logRepository.createMealLog({
    ...data,
    logged_by_user_id: user.user_id,
  });
};

/**
 * Get all meal logs for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of meal logs
 */
export const getMealLogs = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID diperlukan');
  }
  return logRepository.findMealLogs(patientId);
};

/**
 * Add a new medication adherence log entry
 * @param {object} data - Adherence log data { patient_id, medication_name, status, notes }
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The created adherence log
 * @throws {Error} - If required fields are missing or prescription not found
 */
export const addAdherenceLog = async (data, user) => {
  // 1. Destructure medication_name, validate required fields
  const { medication_name, ...payloadForPrisma } = data;
  
  const { patient_id, status } = payloadForPrisma; 

  if (!patient_id || !medication_name || !status) { 
    throw new Error('patient_id, medication_name, dan status diperlukan'); 
  }

  // 2. Find the active prescription for the given medication and patient
  const activePrescription = await prescriptionRepository.findActivePrescription(
    patient_id,
    medication_name
  );

  if (!activePrescription) {
    throw new Error(`Resep aktif untuk obat ${medication_name} tidak ditemukan untuk pasien ini.`);
  }

  return logRepository.createAdherenceLog({
    ...payloadForPrisma, 
    prescription_id: activePrescription.prescription_id, 
    logged_by_user_id: user.user_id,
  });
};

/**
 * Get all medication adherence logs for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of adherence logs
 */
export const getAdherenceLogs = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }
  return logRepository.findAdherenceLogs(patientId);
};

/**
 * Add a new patient progress snapshot
 * @param {object} data - Snapshot data { patient_id, recorded_at, blood_pressure, heart_rate, temperature, mood, notes }
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The created snapshot
 */
export const addSnapshotLog = async (data, user) => {
  if (!data.patient_id || !data.recorded_at) {
    throw new Error('patient_id and recorded_at are required');
  }

  return logRepository.createSnapshotLog({
    ...data,
    recorded_by_user_id: user.user_id,
  });
};

/**
 * Get all patient progress snapshots for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of snapshots
 */
export const getSnapshotLogs = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }
  return logRepository.findSnapshotLogs(patientId);
};

/**
 * Update a progress log (owner only)
 * @param {string} logId - The log ID
 * @param {string} logText - Updated log text
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The updated log
 */
export const updateProgressLog = async (logId, logText, user) => {
  if (!logId || !logText) {
    throw new Error('Log ID dan log_text are required');
  }
  return logRepository.updateProgressLog(logId, logText, user.user_id);
};

/**
 * Delete a progress log (owner only)
 * @param {string} logId - The log ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The deleted log
 */
export const deleteProgressLog = async (logId, user) => {
  if (!logId) {
    throw new Error('Log ID is required');
  }
  return logRepository.deleteProgressLog(logId, user.user_id);
};

/**
 * Update a meal log (owner only)
 * @param {string} logId - The log ID
 * @param {object} data - Updated data
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The updated log
 */
export const updateMealLog = async (logId, data, user) => {
  if (!logId) {
    throw new Error('Log ID is required');
  }
  return logRepository.updateMealLog(logId, data, user.user_id);
};

/**
 * Delete a meal log (owner only)
 * @param {string} logId - The log ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The deleted log
 */
export const deleteMealLog = async (logId, user) => {
  if (!logId) {
    throw new Error('Log ID is required');
  }
  return logRepository.deleteMealLog(logId, user.user_id);
};

/**
 * Update a medication adherence log (owner only)
 * @param {string} logId - The log ID
 * @param {object} data - Updated data
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The updated log
 */
export const updateAdherenceLog = async (logId, data, user) => {
  if (!logId) {
    throw new Error('Log ID is required');
  }
  return logRepository.updateAdherenceLog(logId, data, user.user_id);
};

/**
 * Delete a medication adherence log (owner only)
 * @param {string} logId - The log ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The deleted log
 */
export const deleteAdherenceLog = async (logId, user) => {
  if (!logId) {
    throw new Error('Log ID is required');
  }
  return logRepository.deleteAdherenceLog(logId, user.user_id);
};

/**
 * Update a patient progress snapshot (owner only)
 * @param {string} snapshotId - The snapshot ID
 * @param {object} data - Updated data
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The updated snapshot
 */
export const updateSnapshotLog = async (snapshotId, data, user) => {
  if (!snapshotId) {
    throw new Error('Snapshot ID is required');
  }
  return logRepository.updateSnapshotLog(snapshotId, data, user.user_id);
};

/**
 * Delete a patient progress snapshot (owner only)
 * @param {string} snapshotId - The snapshot ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The deleted snapshot
 */
export const deleteSnapshotLog = async (snapshotId, user) => {
  if (!snapshotId) {
    throw new Error('Snapshot ID is required');
  }
  return logRepository.deleteSnapshotLog(snapshotId, user.user_id);
};

/**
 * Get all progress logs (admin/testing endpoint)
 * @returns {Promise<array>} - Array of all progress logs
 */
export const getAllProgressLogs = async () => {
  return logRepository.findAllProgressLogs();
};

/**
 * Get all meal logs (admin/testing endpoint)
 * @returns {Promise<array>} - Array of all meal logs
 */
export const getAllMealLogs = async () => {
  return logRepository.findAllMealLogs();
};

/**
 * Get all medication adherence logs (admin/testing endpoint)
 * @returns {Promise<array>} - Array of all adherence logs
 */
export const getAllAdherenceLogs = async () => {
  return logRepository.findAllAdherenceLogs();
};

/**
 * Get all patient progress snapshots (admin/testing endpoint)
 * @returns {Promise<array>} - Array of all snapshots
 */
export const getAllSnapshotLogs = async () => {
  return logRepository.findAllSnapshotLogs();
};

/**
 * Add a new exercise adherence log entry
 */
export const addExerciseAdherenceLog = async (data, user) => {
  if (!data.patient_id || !data.patient_ex_id || !data.status) {
    throw new Error('patient_id, patient_ex_id, dan status diperlukan');
  }

  return logRepository.createExerciseAdherenceLog({
    ...data,
    logged_by_user_id: user.user_id,
  });
};

/**
 * Get all exercise adherence logs for a patient
 */
export const getExerciseAdherenceLogs = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID diperlukan');
  }
  return logRepository.findExerciseAdherenceLogs(patientId);
};

/**
 * Update an exercise adherence log
 */
export const updateExerciseAdherenceLog = async (logId, data) => {
  return logRepository.updateExerciseAdherenceLog(logId, data);
};

/**
 * Delete an exercise adherence log
 */
export const deleteExerciseAdherenceLog = async (logId) => {
  return logRepository.deleteExerciseAdherenceLog(logId);
};

/**
 * Get all exercise adherence logs (admin)
 */
export const getAllExerciseAdherenceLogs = async () => {
  return logRepository.findAllExerciseAdherenceLogs();
};

/**
 * Add a new nutrition adherence log entry
 */
export const addNutritionAdherenceLog = async (data, user) => {
  if (!data.patient_id || !data.patient_food_id || !data.status) {
    throw new Error('patient_id, patient_food_id, dan status diperlukan');
  }

  return logRepository.createNutritionAdherenceLog({
    ...data,
    logged_by_user_id: user.user_id,
  });
};

/**
 * Get all nutrition adherence logs for a patient
 */
export const getNutritionAdherenceLogs = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID diperlukan');
  }
  return logRepository.findNutritionAdherenceLogs(patientId);
};

/**
 * Update a nutrition adherence log
 */
export const updateNutritionAdherenceLog = async (logId, data) => {
  return logRepository.updateNutritionAdherenceLog(logId, data);
};

/**
 * Delete a nutrition adherence log
 */
export const deleteNutritionAdherenceLog = async (logId) => {
  return logRepository.deleteNutritionAdherenceLog(logId);
};

/**
 * Get all nutrition adherence logs (admin)
 */
export const getAllNutritionAdherenceLogs = async () => {
  return logRepository.findAllNutritionAdherenceLogs();
};

