const db = require('../config/db');

const findConflicts = async (medicationName, concurrentNames = []) => {
  if (!concurrentNames.length) {
    return [];
  }

  const lowerConcurrent = concurrentNames.map((name) => name.toLowerCase());

  const query = `
    SELECT *
    FROM medication_interactions
    WHERE (
      LOWER(medication_a) = ANY($1)
      AND LOWER(medication_b) = LOWER($2)
    )
    OR (
      LOWER(medication_b) = ANY($1)
      AND LOWER(medication_a) = LOWER($2)
    );
  `;

  const { rows } = await db.query(query, [lowerConcurrent, medicationName.toLowerCase()]);
  return rows;
};

const upsertInteractionPair = async (data) => {
  const {
    interaction_id,
    medication_a,
    medication_b,
    severity,
    description,
  } = data;

  const query = `
    INSERT INTO medication_interactions (
      interaction_id,
      medication_a,
      medication_b,
      severity,
      description
    )
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (medication_a, medication_b)
    DO UPDATE SET
      severity = EXCLUDED.severity,
      description = EXCLUDED.description,
      updated_at = NOW()
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    interaction_id,
    medication_a,
    medication_b,
    severity,
    description || null,
  ]);

  return rows[0];
};

module.exports = {
  findConflicts,
  upsertInteractionPair,
};
