import { verifyToken } from '../utils/jwt.util.js';

/**
 * Middleware to authenticate JWT tokens
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Token verification failed',
    });
  }
};
