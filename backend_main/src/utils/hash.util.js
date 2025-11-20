import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcryptjs
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param {string} password - The plain text password
 * @param {string} hash - The hashed password
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
