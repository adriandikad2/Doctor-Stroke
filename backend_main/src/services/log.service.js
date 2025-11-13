const logRepository = require('../repositories/log.repository');
const patientRepository = require('../repositories/patient.repository');

const ensurePatientLink = async (userId, patient_id) => {
  const isLinked = await patientRepository.isUserLinkedToPatient(userId, patient_id);
  if (!isLinked) {
    throw new Error('Access denied: Not linked to patient');
  }
};

const addNewLog = async (patient_id, log_text, caregiver_id) => {
  await ensurePatientLink(caregiver_id, patient_id);

  const logData = {
    log_id: null,
    patient_id,
    caregiver_id,
    log_text,
  };

  const newLog = await logRepository.createLog(logData);
  return newLog;
};

const getLogsForPatient = async (patient_id, requesterId) => {
  await ensurePatientLink(requesterId, patient_id);
  const logs = await logRepository.findLogsByPatientId(patient_id);
  return logs;
};

const updateUserLog = async (log_id, log_text, caregiver_id) => {
  const existingLog = await logRepository.findLogById(log_id);
  if (!existingLog) {
    throw new Error('Log not found');
  }

  await ensurePatientLink(caregiver_id, existingLog.patient_id);

  const updatedLog = await logRepository.updateLog(log_id, log_text, caregiver_id);

  if (!updatedLog) {
    throw new Error('Log not found or access denied');
  }

  return updatedLog;
};

const deleteUserLog = async (log_id, caregiver_id) => {
  const existingLog = await logRepository.findLogById(log_id);
  if (!existingLog) {
    throw new Error('Log not found');
  }

  await ensurePatientLink(caregiver_id, existingLog.patient_id);

  const deletedLog = await logRepository.deleteLog(log_id, caregiver_id);

  if (!deletedLog) {
    throw new Error('Log not found or access denied');
  }

  return deletedLog;
};

module.exports = {
  addNewLog,
  getLogsForPatient,
  updateUserLog,
  deleteUserLog,
};
