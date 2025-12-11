import express from 'express';
import * as nutritionCatalogController from '../controllers/nutrition-catalog.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/nutrition-catalogs/all
 * Get all nutrition food catalogs (admin/testing endpoint)
 */
router.get('/all', authenticateToken, nutritionCatalogController.handleGetAllCatalogs);

/**
 * GET /api/nutrition-catalogs/category/:category
 * Get nutrition catalogs by food category
 */
router.get('/category/:category', authenticateToken, nutritionCatalogController.handleGetByCategory);

/**
 * POST /api/nutrition-catalogs
 * Create a new nutrition catalog (admin only)
 */
router.post('/', authenticateToken, nutritionCatalogController.handleCreateCatalog);

/**
 * GET /api/nutrition-catalogs/:catalogId
 * Get a specific nutrition catalog
 */
router.get('/:catalogId', authenticateToken, nutritionCatalogController.handleGetCatalogById);

/**
 * PUT /api/nutrition-catalogs/:catalogId
 * Update a nutrition catalog (admin only)
 */
router.put('/:catalogId', authenticateToken, nutritionCatalogController.handleUpdateCatalog);

/**
 * DELETE /api/nutrition-catalogs/:catalogId
 * Delete a nutrition catalog (admin only)
 */
router.delete('/:catalogId', authenticateToken, nutritionCatalogController.handleDeleteCatalog);

/**
 * POST /api/nutrition-catalogs/:catalogId/assign
 * Assign a nutrition food to a patient (doctor only)
 */
router.post('/:catalogId/assign', authenticateToken, nutritionCatalogController.handleAssignToPatient);

/**
 * GET /api/nutrition-catalogs/patient/:patientId
 * Get all nutrition foods assigned to a patient
 */
router.get('/patient/:patientId', authenticateToken, nutritionCatalogController.handleGetPatientFoods);

/**
 * DELETE /api/nutrition-catalogs/patient/:patientFoodId
 * Remove a nutrition food from a patient
 */
router.delete('/patient/:patientFoodId', authenticateToken, nutritionCatalogController.handleRemovePatientFood);

/**
 * POST /api/nutrition-catalogs/adherence/log
 * Log adherence for a food item
 */
router.post('/adherence/log', authenticateToken, nutritionCatalogController.handleLogAdherence);

/**
 * GET /api/nutrition-catalogs/adherence/:patientId
 * Get adherence stats for a patient
 */
router.get('/adherence/:patientId', authenticateToken, nutritionCatalogController.handleGetAdherence);

export default router;
