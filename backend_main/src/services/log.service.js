const logRepository = require('../repositories/log.repository');
const { randomUUID } = require('crypto');

const addNewLog = async (patient_id, log_text, caregiver_id) => {
  const log_id = randomUUID();
  
  const logData = {
    log_id,
    patient_id,
    caregiver_id,
    log_text
  };
  
  const newLog = await logRepository.createLog(logData);
  return newLog;
};

const getLogsForPatient = async (patient_id) => {
  const logs = await logRepository.findLogsByPatientId(patient_id);
  return logs;
};

const updateUserLog = async (log_id, log_text, caregiver_id) => {
  const updatedLog = await logRepository.updateLog(log_id, log_text, caregiver_id);
  
  if (!updatedLog) {
    throw new Error('Log tidak ditemukan atau Anda tidak punya hak akses');
  }
  
  return updatedLog;
};

const deleteUserLog = async (log_id, caregiver_id) => {
  const deletedLog = await logRepository.deleteLog(log_id, caregiver_id);
  
  if (!deletedLog) {
    throw new Error('Log tidak ditemukan atau Anda tidak punya hak akses');
  }
  
  return deletedLog;
};

module.exports = {
  addNewLog,
  getLogsForPatient,
  updateUserLog,
  deleteUserLog,
};
