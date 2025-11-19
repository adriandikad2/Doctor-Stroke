import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authController.handleRegister);

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', authController.handleLogin);

export default router;
