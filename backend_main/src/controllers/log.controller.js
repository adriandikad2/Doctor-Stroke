const logService = require('../services/log.service');

const handleCreateLog = async (req, res) => {
  try {
    const { patient_id, log_text } = req.body;
    const caregiver_id = req.user.userId; // From auth middleware
    
    const newLog = await logService.addNewLog(patient_id, log_text, caregiver_id);
    
    res.status(201).json({ 
      message: 'Progress log created successfully', 
      log: newLog 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const handleGetLogsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const logs = await logService.getLogsForPatient(patientId, req.user.userId);
    
    res.status(200).json({ 
      message: 'Progress logs retrieved successfully', 
      logs 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleUpdateLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const { log_text } = req.body;
    const caregiver_id = req.user.userId; // From auth middleware
    
    const updatedLog = await logService.updateUserLog(logId, log_text, caregiver_id);
    
    res.status(200).json({ 
      message: 'Progress log updated successfully', 
      log: updatedLog 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const handleDeleteLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const caregiver_id = req.user.userId; // From auth middleware
    
    const deletedLog = await logService.deleteUserLog(logId, caregiver_id);
    
    res.status(200).json({ 
      message: 'Progress log deleted successfully', 
      log: deletedLog 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  handleCreateLog,
  handleGetLogsForPatient,
  handleUpdateLog,
  handleDeleteLog,
};
