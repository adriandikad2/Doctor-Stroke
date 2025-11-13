const db = require('../config/db');

const createAppointment = async (appointmentData) => {
  const { appointment_id, patient_id, doctor_id, caregiver_id, date_time, notes, status } = appointmentData;
  const query = `
    INSERT INTO appointments (appointment_id, patient_id, doctor_id, caregiver_id, date_time, notes, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [appointment_id, patient_id, doctor_id, caregiver_id, date_time, notes, status || 'scheduled']);
  return rows[0];
};

const findAppointmentsByUserId = async (user_id) => {
  const query = `
    SELECT * FROM appointments 
    WHERE caregiver_id = $1 OR doctor_id = $1
    ORDER BY date_time ASC;
  `;
  const { rows } = await db.query(query, [user_id]);
  return rows;
};

module.exports = {
  createAppointment,
  findAppointmentsByUserId,
};
