import express from 'express';
import * as nutritionController from '../controllers/nutrition.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/nutrition/all
 * Get all nutrition profiles (admin/testing endpoint)
 */
router.get('/all', authenticateToken, nutritionController.handleGetAllProfiles);

/**
 * GET /api/nutrition/:patientId
 * Get nutrition profile for a patient
 */
router.get('/:patientId', authenticateToken, nutritionController.handleGetProfile);

/**
 * PUT /api/nutrition/:patientId
 * Update or create nutrition profile (doctor/therapist only)
 */
router.put('/:patientId', authenticateToken, nutritionController.handleUpdateProfile);

/**
 * GET /api/nutrition/:patientId/feedback
 * Get detailed feedback on today's logged meals compared to targets (Family only)
 */
router.get('/:patientId/feedback', authenticateToken, nutritionController.handleGetMealFeedback);

export default router;
