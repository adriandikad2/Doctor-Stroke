import * as authService from '../services/auth.service.js';

/**
 * Handle user registration
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleRegister = async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await authService.registerUser(userData);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

/**
 * Handle user login
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    if (!result || !result.token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};
