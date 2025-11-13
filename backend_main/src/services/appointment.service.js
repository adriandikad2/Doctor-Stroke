const appointmentRepository = require('../repositories/appointment.repository');

const scheduleNewAppointment = async (appointmentData, caregiverId) => {
  const completeAppointmentData = {
    appointment_id: null,
    patient_id: appointmentData.patient_id,
    doctor_id: appointmentData.doctor_id,
    caregiver_id: caregiverId,
    date_time: appointmentData.date_time,
    notes: appointmentData.notes || null,
    status: appointmentData.status || 'scheduled'
  };
  
  const newAppointment = await appointmentRepository.createAppointment(completeAppointmentData);
  return newAppointment;
};

const getMySchedule = async (userId) => {
  const appointments = await appointmentRepository.findAppointmentsByUserId(userId);
  return appointments;
};

module.exports = {
  scheduleNewAppointment,
  getMySchedule,
};
