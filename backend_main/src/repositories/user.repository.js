const db = require('../config/db');

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await db.query(query, [email]);
  return rows[0];
};

const createUser = async (user) => {
  const { user_id, name, email, password_hash, role, specialty } = user;
  const query = `
    INSERT INTO users (user_id, name, email, password_hash, role, specialty)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [user_id, name, email, password_hash, role, specialty || null]);
  return rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
};
