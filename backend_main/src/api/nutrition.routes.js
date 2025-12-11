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
 * GET /api/nutrition/catalog
 * Get all nutrition items from catalog
 */
router.get('/catalog', authenticateToken, nutritionController.handleGetNutritionCatalog);

/**
 * GET /api/nutrition/catalog/:catalogId
 * Get nutrition item detail from catalog
 */
router.get('/catalog/:catalogId', authenticateToken, nutritionController.handleGetNutritionDetail);

/**
 * POST /api/nutrition/meal-plan
 * Doctor creates meal plan for patient
 */
router.post('/meal-plan', authenticateToken, nutritionController.handleCreateMealPlan);

/**
 * GET /api/nutrition/patient/:patientId
 * Get all meal plans for a patient
 */
router.get('/patient/:patientId', authenticateToken, nutritionController.handleGetPatientMealPlans);

/**
 * POST /api/nutrition/meal-log
 * Family logs meal consumption
 */
router.post('/meal-log', authenticateToken, nutritionController.handleLogMeal);

/**
 * GET /api/nutrition/meal-logs/:patientId
 * Get all meal logs for a patient
 */
router.get('/meal-logs/:patientId', authenticateToken, nutritionController.handleGetMealLogs);

/**
 * GET /api/nutrition/profile/:patientId
 * Get nutrition profile for a patient
 */
router.get('/profile/:patientId', authenticateToken, nutritionController.handleGetProfile);

/**
 * PUT /api/nutrition/profile/:patientId
 * Update or create nutrition profile (doctor/therapist only)
 */
router.put('/profile/:patientId', authenticateToken, nutritionController.handleUpdateProfile);

/**
 * GET /api/nutrition/:patientId/feedback
 * Get detailed feedback on today's logged meals compared to targets (Family only)
 */
router.get('/:patientId/feedback', authenticateToken, nutritionController.handleGetMealFeedback);

/**
 * PUT /api/nutrition/meal-plan/:mealPlanId
 * Update patient meal plan
 */
router.put('/meal-plan/:mealPlanId', authenticateToken, nutritionController.handleUpdateMealPlan);

/**
 * DELETE /api/nutrition/meal-plan/:mealPlanId
 * Delete patient meal plan
 */
router.delete('/meal-plan/:mealPlanId', authenticateToken, nutritionController.handleDeleteMealPlan);

/**
 * PUT /api/nutrition/:patientId
 * Legacy: Update nutrition profile
 */
router.put('/:patientId', authenticateToken, nutritionController.handleUpdateProfile);

export default router;
