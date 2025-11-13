const appointmentService = require('../services/appointment.service');

const handleCreateAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    const caregiverId = req.user.userId; // From auth middleware
    
    const newAppointment = await appointmentService.scheduleNewAppointment(appointmentData, caregiverId);
    
    res.status(201).json({ 
      message: 'Appointment created successfully', 
      appointment: newAppointment 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const handleGetMyAppointments = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    
    const appointments = await appointmentService.getMySchedule(userId);
    
    res.status(200).json({ 
      message: 'Appointments retrieved successfully', 
      appointments 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleCreateAppointment,
  handleGetMyAppointments,
};
