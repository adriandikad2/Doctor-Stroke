const appointmentRepository = require('../repositories/appointment.repository');
const { randomUUID } = require('crypto');

const scheduleNewAppointment = async (appointmentData, caregiverId) => {
  const appointment_id = randomUUID();
  
  const completeAppointmentData = {
    appointment_id,
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
