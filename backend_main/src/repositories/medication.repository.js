const db = require('../config/db');

const createSchedule = async (scheduleData) => {
  const { schedule_id, patient_id, medication_name, dosage, frequency, time_to_take } = scheduleData;
  const query = `
    INSERT INTO medication_schedules (schedule_id, patient_id, medication_name, dosage, frequency, time_to_take)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [schedule_id, patient_id, medication_name, dosage, frequency, time_to_take]);
  return rows[0];
};

const findSchedulesByPatientId = async (patient_id) => {
  const query = `
    SELECT * FROM medication_schedules 
    WHERE patient_id = $1 
    ORDER BY time_to_take;
  `;
  const { rows } = await db.query(query, [patient_id]);
  return rows;
};

const findScheduleById = async (schedule_id) => {
  const query = `
    SELECT * FROM medication_schedules 
    WHERE schedule_id = $1;
  `;
  const { rows } = await db.query(query, [schedule_id]);
  return rows[0];
};

const updateSchedule = async (schedule_id, scheduleData) => {
  const { medication_name, dosage, frequency, time_to_take } = scheduleData;
  const query = `
    UPDATE medication_schedules 
    SET medication_name = $1, dosage = $2, frequency = $3, time_to_take = $4 
    WHERE schedule_id = $5 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [medication_name, dosage, frequency, time_to_take, schedule_id]);
  return rows[0];
};

const deleteSchedule = async (schedule_id) => {
  const query = `
    DELETE FROM medication_schedules 
    WHERE schedule_id = $1 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [schedule_id]);
  return rows[0];
};

module.exports = {
  createSchedule,
  findSchedulesByPatientId,
  findScheduleById,
  updateSchedule,
  deleteSchedule,
};
