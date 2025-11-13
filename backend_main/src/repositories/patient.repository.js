const db = require('../config/db');

const createPatient = async (patientData) => {
  const { patient_id, name, date_of_birth, medical_history } = patientData;
  const query = `
    INSERT INTO patients (patient_id, name, date_of_birth, medical_history)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [patient_id, name, date_of_birth, medical_history]);
  return rows[0];
};

const linkPatientToUser = async (patient_id, user_id) => {
  const query = `
    INSERT INTO patient_care_team (patient_id, user_id)
    VALUES ($1, $2);
  `;
  await db.query(query, [patient_id, user_id]);
};

const findPatientsByUserId = async (user_id) => {
  const query = `
    SELECT p.* 
    FROM patients p 
    JOIN patient_care_team pct ON p.patient_id = pct.patient_id 
    WHERE pct.user_id = $1;
  `;
  const { rows } = await db.query(query, [user_id]);
  return rows;
};

const isUserLinkedToPatient = async (user_id, patient_id) => {
  const query = `
    SELECT 1 FROM patient_care_team 
    WHERE user_id = $1 AND patient_id = $2;
  `;
  const { rows } = await db.query(query, [user_id, patient_id]);
  return rows.length > 0;
};

module.exports = {
  createPatient,
  linkPatientToUser,
  findPatientsByUserId,
  isUserLinkedToPatient,
};
