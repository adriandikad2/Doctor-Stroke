const db = require('../config/db');

const createPrescription = async (data) => {
  const {
    prescription_id,
    patient_id,
    doctor_id,
    medication_name,
    dosage,
    instructions,
    frequency_per_day,
    dosing_times,
    start_date,
    end_date,
    reminder_window_minutes,
    is_critical,
  } = data;

  const query = `
    INSERT INTO prescriptions (
      prescription_id,
      patient_id,
      doctor_id,
      medication_name,
      dosage,
      instructions,
      frequency_per_day,
      dosing_times,
      start_date,
      end_date,
      reminder_window_minutes,
      is_critical
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    prescription_id,
    patient_id,
    doctor_id,
    medication_name,
    dosage,
    instructions || null,
    frequency_per_day,
    dosing_times,
    start_date,
    end_date || null,
    reminder_window_minutes,
    is_critical ?? false,
  ]);

  return rows[0];
};

const findPrescriptionById = async (prescription_id) => {
  const { rows } = await db.query(
    'SELECT * FROM prescriptions WHERE prescription_id = $1',
    [prescription_id],
  );
  return rows[0];
};

const findPrescriptionsByPatient = async (patient_id, { includeInactive = false } = {}) => {
  const statusFilter = includeInactive ? '' : 'AND is_active = true';
  const query = `
    SELECT *
    FROM prescriptions
    WHERE patient_id = $1
    ${statusFilter}
    ORDER BY start_date DESC, created_at DESC;
  `;
  const { rows } = await db.query(query, [patient_id]);
  return rows;
};

const updatePrescription = async (prescription_id, updates) => {
  const allowedFields = [
    'medication_name',
    'dosage',
    'instructions',
    'frequency_per_day',
    'dosing_times',
    'start_date',
    'end_date',
    'reminder_window_minutes',
    'is_critical',
  ];

  const setClauses = [];
  const values = [];
  let index = 1;

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      setClauses.push(`${field} = $${index}`);
      values.push(updates[field]);
      index += 1;
    }
  });

  if (!setClauses.length) {
    return findPrescriptionById(prescription_id);
  }

  setClauses.push(`updated_at = NOW()`);

  const query = `
    UPDATE prescriptions
    SET ${setClauses.join(', ')}
    WHERE prescription_id = $${index}
    RETURNING *;
  `;

  values.push(prescription_id);

  const { rows } = await db.query(query, values);
  return rows[0];
};

const setPrescriptionStatus = async (prescription_id, is_active) => {
  const query = `
    UPDATE prescriptions
    SET is_active = $1,
        updated_at = NOW()
    WHERE prescription_id = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [is_active, prescription_id]);
  return rows[0];
};

const listActiveMedicationNames = async (patient_id, excludePrescriptionId = null) => {
  const params = [patient_id];
  let filter = '';

  if (excludePrescriptionId) {
    params.push(excludePrescriptionId);
    filter = 'AND prescription_id <> $2';
  }

  const query = `
    SELECT medication_name
    FROM prescriptions
    WHERE patient_id = $1
      AND is_active = true
      ${filter}
  `;

  const { rows } = await db.query(query, params);
  return rows.map((row) => row.medication_name);
};

module.exports = {
  createPrescription,
  findPrescriptionById,
  findPrescriptionsByPatient,
  updatePrescription,
  setPrescriptionStatus,
  listActiveMedicationNames,
};
