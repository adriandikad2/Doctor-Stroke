import express from 'express';
import * as logController from '../controllers/log.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Exercise Adherence Logs Routes
 */

/**
 * GET /api/logs/exercise-adherence/all
 * Get all exercise adherence logs (admin/testing endpoint)
 */
router.get('/exercise-adherence/all', authenticateToken, logController.handleGetAllExerciseAdherenceLogs);

/**
 * POST /api/logs/exercise-adherence
 * Create a new exercise adherence log entry
 */
router.post('/exercise-adherence', authenticateToken, logController.handleCreateExerciseAdherenceLog);

/**
 * GET /api/logs/exercise-adherence/:patientId
 * Get all exercise adherence logs for a patient
 */
router.get('/exercise-adherence/:patientId', authenticateToken, logController.handleGetExerciseAdherenceLogs);

/**
 * PUT /api/logs/exercise-adherence/:logId
 * Update an exercise adherence log (owner only)
 */
router.put('/exercise-adherence/:logId', authenticateToken, logController.handleUpdateExerciseAdherenceLog);

/**
 * DELETE /api/logs/exercise-adherence/:logId
 * Delete an exercise adherence log (owner only)
 */
router.delete('/exercise-adherence/:logId', authenticateToken, logController.handleDeleteExerciseAdherenceLog);

/**
 * Nutrition Adherence Logs Routes
 */

/**
 * GET /api/logs/nutrition-adherence/all
 * Get all nutrition adherence logs (admin/testing endpoint)
 */
router.get('/nutrition-adherence/all', authenticateToken, logController.handleGetAllNutritionAdherenceLogs);

/**
 * POST /api/logs/nutrition-adherence
 * Create a new nutrition adherence log entry
 */
router.post('/nutrition-adherence', authenticateToken, logController.handleCreateNutritionAdherenceLog);

/**
 * GET /api/logs/nutrition-adherence/:patientId
 * Get all nutrition adherence logs for a patient
 */
router.get('/nutrition-adherence/:patientId', authenticateToken, logController.handleGetNutritionAdherenceLogs);

/**
 * PUT /api/logs/nutrition-adherence/:logId
 * Update a nutrition adherence log (owner only)
 */
router.put('/nutrition-adherence/:logId', authenticateToken, logController.handleUpdateNutritionAdherenceLog);

/**
 * DELETE /api/logs/nutrition-adherence/:logId
 * Delete a nutrition adherence log (owner only)
 */
router.delete('/nutrition-adherence/:logId', authenticateToken, logController.handleDeleteNutritionAdherenceLog);

export default router;
