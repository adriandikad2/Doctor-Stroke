const db = require('../config/db');

const createLog = async (logData) => {
  const { log_id, patient_id, caregiver_id, log_text } = logData;
  const query = `
    INSERT INTO progress_logs (log_id, patient_id, caregiver_id, log_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [log_id, patient_id, caregiver_id, log_text]);
  return rows[0];
};

const findLogsByPatientId = async (patient_id) => {
  const query = `
    SELECT * FROM progress_logs 
    WHERE patient_id = $1 
    ORDER BY created_at DESC;
  `;
  const { rows } = await db.query(query, [patient_id]);
  return rows;
};

const findLogById = async (log_id) => {
  const query = `
    SELECT * FROM progress_logs 
    WHERE log_id = $1;
  `;
  const { rows } = await db.query(query, [log_id]);
  return rows[0];
};

const updateLog = async (log_id, log_text, caregiver_id) => {
  const query = `
    UPDATE progress_logs 
    SET log_text = $1 
    WHERE log_id = $2 AND caregiver_id = $3 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [log_text, log_id, caregiver_id]);
  return rows[0];
};

const deleteLog = async (log_id, caregiver_id) => {
  const query = `
    DELETE FROM progress_logs 
    WHERE log_id = $1 AND caregiver_id = $2 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [log_id, caregiver_id]);
  return rows[0];
};

module.exports = {
  createLog,
  findLogsByPatientId,
  findLogById,
  updateLog,
  deleteLog,
};
