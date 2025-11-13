const patientRepository = require('../repositories/patient.repository');

const createNewPatient = async (patientData, caregiverId) => {
  const newPatient = await patientRepository.createPatient({
    patient_id: null,
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
