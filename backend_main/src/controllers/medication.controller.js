const medicationService = require('../services/medication.service');

const handleCreateSchedule = async (req, res) => {
  try {
    const scheduleData = req.body;
    const user_id = req.user.userId; // From auth middleware
    
    const newSchedule = await medicationService.addNewSchedule(scheduleData, user_id);
    
    res.status(201).json({ 
      message: 'Medication schedule created successfully', 
      schedule: newSchedule 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const handleGetSchedules = async (req, res) => {
  try {
    const { patientId } = req.params;
    const user_id = req.user.userId; // From auth middleware
    
    const schedules = await medicationService.getSchedulesForPatient(patientId, user_id);
    
    res.status(200).json({ 
      message: 'Medication schedules retrieved successfully', 
      schedules 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const handleUpdateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const scheduleData = req.body;
    const user_id = req.user.userId; // From auth middleware
    
    const updatedSchedule = await medicationService.updateUserSchedule(scheduleId, scheduleData, user_id);
    
    res.status(200).json({ 
      message: 'Medication schedule updated successfully', 
      schedule: updatedSchedule 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const handleDeleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const user_id = req.user.userId; // From auth middleware
    
    const deletedSchedule = await medicationService.deleteUserSchedule(scheduleId, user_id);
    
    res.status(200).json({ 
      message: 'Medication schedule deleted successfully', 
      schedule: deletedSchedule 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  handleCreateSchedule,
  handleGetSchedules,
  handleUpdateSchedule,
  handleDeleteSchedule,
};
