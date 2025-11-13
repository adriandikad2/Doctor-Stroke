const patientService = require('../services/patient.service');

const handleCreatePatient = async (req, res) => {
  try {
    const patientData = req.body;
    const caregiverId = req.user.userId; // From auth middleware
    
    const newPatient = await patientService.createNewPatient(patientData, caregiverId);
    
    res.status(201).json({ 
      message: 'Patient created successfully', 
      patient: newPatient 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const handleGetMyPatients = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    
    const patients = await patientService.getMyPatients(userId);
    
    res.status(200).json({ 
      message: 'Patients retrieved successfully', 
      patients 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleCreatePatient,
  handleGetMyPatients,
};
