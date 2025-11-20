import jwt from 'jsonwebtoken';

/**
 * Create a JWT token
 * @param {object} payload - The payload to sign
 * @returns {string} - The JWT token
 */
export const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @returns {object|null} - The decoded token payload, or null if verification fails
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
