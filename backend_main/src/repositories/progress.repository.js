const db = require('../config/db');

const createSnapshot = async (data) => {
  const {
    entry_id,
    patient_id,
    recorded_by,
    recorded_at,
    mood,
    symptom_score,
    mobility_score,
    exercise_completed,
    blood_pressure_systolic,
    blood_pressure_diastolic,
    medication_adherence_score,
    notes,
    tags,
  } = data;

  const query = `
    INSERT INTO patient_progress_snapshots (
      entry_id,
      patient_id,
      recorded_by,
      recorded_at,
      mood,
      symptom_score,
      mobility_score,
      exercise_completed,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      medication_adherence_score,
      notes,
      tags
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    entry_id,
    patient_id,
    recorded_by,
    recorded_at,
    mood || null,
    symptom_score ?? null,
    mobility_score ?? null,
    exercise_completed ?? null,
    blood_pressure_systolic ?? null,
    blood_pressure_diastolic ?? null,
    medication_adherence_score ?? null,
    notes || null,
    tags?.length ? tags : null,
  ]);

  return rows[0];
};

const getSnapshotsByPatient = async (patient_id, filters = {}) => {
  const conditions = ['patient_id = $1'];
  const values = [patient_id];
  let idx = 2;

  if (filters.startDate) {
    conditions.push(`recorded_at::date >= $${idx}`);
    values.push(filters.startDate);
    idx += 1;
  }

  if (filters.endDate) {
    conditions.push(`recorded_at::date <= $${idx}`);
    values.push(filters.endDate);
    idx += 1;
  }

  const query = `
    SELECT *
    FROM patient_progress_snapshots
    WHERE ${conditions.join(' AND ')}
    ORDER BY recorded_at DESC;
  `;

  const { rows } = await db.query(query, values);
  return rows;
};

const getSnapshotsWithinDays = async (patient_id, days = 7) => {
  const query = `
    SELECT *
    FROM patient_progress_snapshots
    WHERE patient_id = $1
      AND recorded_at >= NOW() - $2::interval
    ORDER BY recorded_at DESC;
  `;

  const { rows } = await db.query(query, [patient_id, `${days} days`]);
  return rows;
};

module.exports = {
  createSnapshot,
  getSnapshotsByPatient,
  getSnapshotsWithinDays,
};
