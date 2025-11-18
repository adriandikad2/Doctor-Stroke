import prisma from '../config/db.js';

/**
 * Create a progress log entry
 * @param {object} data - Progress log data { patient_id, log_text, author_user_id, author_role }
 * @returns {Promise<object>} - The created progress log
 */
export const createProgressLog = async (data) => {
  return prisma.progress_logs.create({
    data,
    include: {
      patient: true,
      author_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Find all progress logs for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of progress logs ordered by creation date
 */
export const findProgressLogs = async (patientId) => {
  return prisma.progress_logs.findMany({
    where: { patient_id: patientId },
    include: {
      patient: true,
      author_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Create a meal log entry
 * @param {object} data - Meal log data { patient_id, logged_for, meal_type, food_items, logged_by_user_id }
 * @returns {Promise<object>} - The created meal log
 */
export const createMealLog = async (data) => {
  return prisma.meal_logs.create({
    data,
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Find all meal logs for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of meal logs ordered by logged_for date
 */
export const findMealLogs = async (patientId) => {
  return prisma.meal_logs.findMany({
    where: { patient_id: patientId },
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
    orderBy: { logged_for: 'desc' },
  });
};

/**
 * Create a medication adherence log entry
 * @param {object} data - Adherence log data { patient_id, medication_name, taken, logged_by_user_id, notes }
 * @returns {Promise<object>} - The created adherence log
 */
export const createAdherenceLog = async (data) => {
  return prisma.medication_adherence_logs.create({
    data,
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Find all medication adherence logs for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of adherence logs ordered by creation date
 */
export const findAdherenceLogs = async (patientId) => {
  return prisma.medication_adherence_logs.findMany({
    where: { patient_id: patientId },
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Create a patient progress snapshot entry
 * @param {object} data - Snapshot data { patient_id, recorded_at, blood_pressure, heart_rate, temperature, mood, notes, recorded_by_user_id }
 * @returns {Promise<object>} - The created snapshot
 */
export const createSnapshotLog = async (data) => {
  return prisma.patient_progress_snapshots.create({
    data,
    include: {
      patient: true,
      recorded_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Find all patient progress snapshots for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of snapshots ordered by recorded_at date
 */
export const findSnapshotLogs = async (patientId) => {
  return prisma.patient_progress_snapshots.findMany({
    where: { patient_id: patientId },
    include: {
      patient: true,
      recorded_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
    orderBy: { recorded_at: 'desc' },
  });
};

/**
 * Update a progress log (owner only)
 * @param {string} logId - The progress log ID
 * @param {string} logText - Updated log text
 * @param {string} authorId - The author user ID (for ownership check)
 * @returns {Promise<object>} - The updated log
 * @throws {Error} - If log not found or user is not the author
 */
export const updateProgressLog = async (logId, logText, authorId) => {
  return prisma.progress_logs.update({
    where: { log_id: logId, author_user_id: authorId },
    data: { log_text },
    include: {
      patient: true,
      author_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Delete a progress log (owner only)
 * @param {string} logId - The progress log ID
 * @param {string} authorId - The author user ID (for ownership check)
 * @returns {Promise<object>} - The deleted log
 * @throws {Error} - If log not found or user is not the author
 */
export const deleteProgressLog = async (logId, authorId) => {
  return prisma.progress_logs.delete({
    where: { log_id: logId, author_user_id: authorId },
    include: {
      patient: true,
      author_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Update a meal log (owner only)
 * @param {string} logId - The meal log ID
 * @param {object} data - Updated meal log data
 * @param {string} userId - The user ID (for ownership check)
 * @returns {Promise<object>} - The updated log
 */
export const updateMealLog = async (logId, data, userId) => {
  return prisma.meal_logs.update({
    where: { meal_log_id: logId, logged_by_user_id: userId },
    data,
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Delete a meal log (owner only)
 * @param {string} logId - The meal log ID
 * @param {string} userId - The user ID (for ownership check)
 * @returns {Promise<object>} - The deleted log
 */
export const deleteMealLog = async (logId, userId) => {
  return prisma.meal_logs.delete({
    where: { meal_log_id: logId, logged_by_user_id: userId },
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Update a medication adherence log (owner only)
 * @param {string} logId - The adherence log ID
 * @param {object} data - Updated adherence log data
 * @param {string} userId - The user ID (for ownership check)
 * @returns {Promise<object>} - The updated log
 */
export const updateAdherenceLog = async (logId, data, userId) => {
  return prisma.medication_adherence_logs.update({
    where: { log_id: logId, logged_by_user_id: userId },
    data,
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Delete a medication adherence log (owner only)
 * @param {string} logId - The adherence log ID
 * @param {string} userId - The user ID (for ownership check)
 * @returns {Promise<object>} - The deleted log
 */
export const deleteAdherenceLog = async (logId, userId) => {
  return prisma.medication_adherence_logs.delete({
    where: { log_id: logId, logged_by_user_id: userId },
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Update a patient progress snapshot (owner only)
 * @param {string} snapshotId - The snapshot ID
 * @param {object} data - Updated snapshot data
 * @param {string} userId - The user ID (for ownership check)
 * @returns {Promise<object>} - The updated snapshot
 */
export const updateSnapshotLog = async (snapshotId, data, userId) => {
  return prisma.patient_progress_snapshots.update({
    where: { snapshot_id: snapshotId, recorded_by_user_id: userId },
    data,
    include: {
      patient: true,
      recorded_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Delete a patient progress snapshot (owner only)
 * @param {string} snapshotId - The snapshot ID
 * @param {string} userId - The user ID (for ownership check)
 * @returns {Promise<object>} - The deleted snapshot
 */
export const deleteSnapshotLog = async (snapshotId, userId) => {
  return prisma.patient_progress_snapshots.delete({
    where: { snapshot_id: snapshotId, recorded_by_user_id: userId },
    include: {
      patient: true,
      recorded_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
  });
};

/**
 * Find all progress logs
 * @returns {Promise<array>} - Array of all progress logs
 */
export const findAllProgressLogs = async () => {
  return prisma.progress_logs.findMany({
    include: {
      patient: true,
      author_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Find all meal logs
 * @returns {Promise<array>} - Array of all meal logs
 */
export const findAllMealLogs = async () => {
  return prisma.meal_logs.findMany({
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
    orderBy: { logged_for: 'desc' },
  });
};

/**
 * Find all medication adherence logs
 * @returns {Promise<array>} - Array of all adherence logs
 */
export const findAllAdherenceLogs = async () => {
  return prisma.medication_adherence_logs.findMany({
    include: {
      patient: true,
      logged_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Find all patient progress snapshots
 * @returns {Promise<array>} - Array of all snapshots
 */
export const findAllSnapshotLogs = async () => {
  return prisma.patient_progress_snapshots.findMany({
    include: {
      patient: true,
      recorded_by_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
          family_profile: true,
        },
      },
    },
    orderBy: { recorded_at: 'desc' },
  });
};
