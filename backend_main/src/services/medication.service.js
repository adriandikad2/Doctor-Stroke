const medicationRepository = require('../repositories/medication.repository');
const patientRepository = require('../repositories/patient.repository');

const addNewSchedule = async (scheduleData, user_id) => {
  const isLinked = await patientRepository.isUserLinkedToPatient(user_id, scheduleData.patient_id);
  
  if (!isLinked) {
    throw new Error('You do not have access to this patient');
  }
  
  const completeScheduleData = {
    schedule_id: null,
    ...scheduleData
  };
  
  const newSchedule = await medicationRepository.createSchedule(completeScheduleData);
  return newSchedule;
};

const getSchedulesForPatient = async (patient_id, user_id) => {
  const isLinked = await patientRepository.isUserLinkedToPatient(user_id, patient_id);
  
  if (!isLinked) {
    throw new Error('You do not have access to this patient');
  }
  
  const schedules = await medicationRepository.findSchedulesByPatientId(patient_id);
  return schedules;
};

const updateUserSchedule = async (schedule_id, scheduleData, user_id) => {
  const existingSchedule = await medicationRepository.findScheduleById(schedule_id);
  
  if (!existingSchedule) {
    throw new Error('Medication schedule not found');
  }
  
  const isLinked = await patientRepository.isUserLinkedToPatient(user_id, existingSchedule.patient_id);
  
  if (!isLinked) {
    throw new Error('You do not have access to this patient');
  }
  
  const updatedSchedule = await medicationRepository.updateSchedule(schedule_id, scheduleData);
  return updatedSchedule;
};

const deleteUserSchedule = async (schedule_id, user_id) => {
  const existingSchedule = await medicationRepository.findScheduleById(schedule_id);
  
  if (!existingSchedule) {
    throw new Error('Medication schedule not found');
  }
  
  const isLinked = await patientRepository.isUserLinkedToPatient(user_id, existingSchedule.patient_id);
  
  if (!isLinked) {
    throw new Error('You do not have access to this patient');
  }
  
  const deletedSchedule = await medicationRepository.deleteSchedule(schedule_id);
  return deletedSchedule;
};

module.exports = {
  addNewSchedule,
  getSchedulesForPatient,
  updateUserSchedule,
  deleteUserSchedule,
};
