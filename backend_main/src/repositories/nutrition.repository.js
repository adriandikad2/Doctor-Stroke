const db = require('../config/db');

const upsertNutritionProfile = async (profile) => {
  const {
    patient_id,
    calorie_target_min,
    calorie_target_max,
    sodium_limit_mg,
    fiber_target_g,
    fluid_limit_ml,
    updated_by,
  } = profile;

  const query = `
    INSERT INTO nutrition_profiles (
      patient_id,
      calorie_target_min,
      calorie_target_max,
      sodium_limit_mg,
      fiber_target_g,
      fluid_limit_ml,
      updated_by
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (patient_id)
    DO UPDATE SET
      calorie_target_min = EXCLUDED.calorie_target_min,
      calorie_target_max = EXCLUDED.calorie_target_max,
      sodium_limit_mg = EXCLUDED.sodium_limit_mg,
      fiber_target_g = EXCLUDED.fiber_target_g,
      fluid_limit_ml = EXCLUDED.fluid_limit_ml,
      updated_by = EXCLUDED.updated_by,
      updated_at = NOW()
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    patient_id,
    calorie_target_min,
    calorie_target_max,
    sodium_limit_mg,
    fiber_target_g,
    fluid_limit_ml,
    updated_by,
  ]);

  return rows[0];
};

const getNutritionProfile = async (patient_id) => {
  const { rows } = await db.query(
    'SELECT * FROM nutrition_profiles WHERE patient_id = $1',
    [patient_id],
  );
  return rows[0];
};

const logMeal = async (meal) => {
  const {
    meal_id,
    patient_id,
    logged_by,
    meal_type,
    foods,
    sodium_mg,
    calories,
    fiber_g,
    sugar_g,
    logged_for,
    feedback,
  } = meal;

  const query = `
    INSERT INTO meal_logs (
      meal_id,
      patient_id,
      logged_by,
      meal_type,
      foods,
      sodium_mg,
      calories,
      fiber_g,
      sugar_g,
      logged_for,
      feedback
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    meal_id,
    patient_id,
    logged_by,
    meal_type,
    foods,
    sodium_mg,
    calories,
    fiber_g,
    sugar_g || null,
    logged_for,
    feedback,
  ]);

  return rows[0];
};

const getMealsByPatient = async (patient_id, { startDate, endDate } = {}) => {
  const conditions = ['patient_id = $1'];
  const values = [patient_id];
  let idx = 2;

  if (startDate) {
    conditions.push(`logged_for >= $${idx}`);
    values.push(startDate);
    idx += 1;
  }

  if (endDate) {
    conditions.push(`logged_for <= $${idx}`);
    values.push(endDate);
  }

  const query = `
    SELECT *
    FROM meal_logs
    WHERE ${conditions.join(' AND ')}
    ORDER BY logged_for DESC, created_at DESC;
  `;

  const { rows } = await db.query(query, values);
  return rows;
};

const getDailyTotals = async (patient_id, logged_for) => {
  const query = `
    SELECT
      COALESCE(SUM(calories), 0) AS calories,
      COALESCE(SUM(sodium_mg), 0) AS sodium_mg,
      COALESCE(SUM(fiber_g), 0) AS fiber_g
    FROM meal_logs
    WHERE patient_id = $1
      AND logged_for = $2;
  `;

  const { rows } = await db.query(query, [patient_id, logged_for]);
  return rows[0];
};

module.exports = {
  upsertNutritionProfile,
  getNutritionProfile,
  logMeal,
  getMealsByPatient,
  getDailyTotals,
};
