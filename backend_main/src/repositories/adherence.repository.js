const db = require('../config/db');

const logAdherenceEvent = async (data) => {
  const {
    adherence_id,
    prescription_id,
    patient_id,
    logged_by,
    status,
    scheduled_time,
    taken_time,
    notes,
  } = data;

  const query = `
    INSERT INTO medication_adherence_logs (
      adherence_id,
      prescription_id,
      patient_id,
      logged_by,
      status,
      scheduled_time,
      taken_time,
      notes
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    adherence_id,
    prescription_id,
    patient_id,
    logged_by,
    status,
    scheduled_time || null,
    taken_time || null,
    notes || null,
  ]);

  return rows[0];
};

const getLogsForPrescription = async (prescription_id, { limit = 50 } = {}) => {
  const query = `
    SELECT *
    FROM medication_adherence_logs
    WHERE prescription_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;

  const { rows } = await db.query(query, [prescription_id, limit]);
  return rows;
};

const getAdherenceStats = async (prescription_id, days = 7) => {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE status = 'taken') AS taken_count,
      COUNT(*) FILTER (WHERE status = 'missed') AS missed_count,
      COUNT(*) FILTER (WHERE status = 'delayed') AS delayed_count,
      COUNT(*) AS total_events
    FROM medication_adherence_logs
    WHERE prescription_id = $1
      AND created_at >= NOW() - $2::interval;
  `;

  const { rows } = await db.query(query, [prescription_id, `${days} days`]);
  return rows[0];
};

const getRecentMissedByPatient = async (patient_id, days = 7) => {
  const query = `
    SELECT COUNT(*) AS missed_count
    FROM medication_adherence_logs
    WHERE patient_id = $1
      AND status = 'missed'
      AND created_at >= NOW() - $2::interval;
  `;

  const { rows } = await db.query(query, [patient_id, `${days} days`]);
  return Number(rows[0]?.missed_count || 0);
};

module.exports = {
  logAdherenceEvent,
  getLogsForPrescription,
  getAdherenceStats,
  getRecentMissedByPatient,
};
