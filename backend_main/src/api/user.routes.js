import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/users/:id
 * Get a user by ID
 */
router.get('/:id', authenticateToken, userController.handleGetUserById);

/**
 * GET /api/users/search?name=...
 * Search users by name
 */
router.get('/search', authenticateToken, userController.handleSearchUsersByName);

export default router;
