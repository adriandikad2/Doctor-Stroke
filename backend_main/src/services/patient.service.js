const patientRepository = require('../repositories/patient.repository');
const { randomUUID } = require('crypto');

const createNewPatient = async (patientData, caregiverId) => {
  const patient_id = randomUUID();
  
  const newPatient = await patientRepository.createPatient({
    patient_id,
    ...patientData
  });
  
  await patientRepository.linkPatientToUser(newPatient.patient_id, caregiverId);
  
  return newPatient;
};

const getMyPatients = async (userId) => {
  const patients = await patientRepository.findPatientsByUserId(userId);
  return patients;
};

module.exports = {
  createNewPatient,
  getMyPatients,
};
