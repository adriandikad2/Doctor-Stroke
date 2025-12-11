import express from 'express';
import * as exerciseCatalogController from '../controllers/exercise-catalog.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/exercise-catalogs/all
 * Get all exercise catalogs (admin/testing endpoint)
 */
router.get('/all', authenticateToken, exerciseCatalogController.handleGetAllCatalogs);

/**
 * GET /api/exercise-catalogs/specialization/:specialization
 * Get exercise catalogs by therapist specialization
 */
router.get('/specialization/:specialization', authenticateToken, exerciseCatalogController.handleGetBySpecialization);

/**
 * POST /api/exercise-catalogs
 * Create a new exercise catalog (admin only)
 */
router.post('/', authenticateToken, exerciseCatalogController.handleCreateCatalog);

/**
 * GET /api/exercise-catalogs/:catalogId
 * Get a specific exercise catalog
 */
router.get('/:catalogId', authenticateToken, exerciseCatalogController.handleGetCatalogById);

/**
 * PUT /api/exercise-catalogs/:catalogId
 * Update an exercise catalog (admin only)
 */
router.put('/:catalogId', authenticateToken, exerciseCatalogController.handleUpdateCatalog);

/**
 * DELETE /api/exercise-catalogs/:catalogId
 * Delete an exercise catalog (admin only)
 */
router.delete('/:catalogId', authenticateToken, exerciseCatalogController.handleDeleteCatalog);

/**
 * POST /api/exercise-catalogs/:catalogId/assign
 * Assign an exercise catalog to a patient (therapist only)
 */
router.post('/:catalogId/assign', authenticateToken, exerciseCatalogController.handleAssignToPatient);

/**
 * GET /api/exercise-catalogs/patient/:patientId
 * Get all exercises assigned to a patient
 */
router.get('/patient/:patientId', authenticateToken, exerciseCatalogController.handleGetPatientExercises);

/**
 * DELETE /api/exercise-catalogs/patient/:patientExId
 * Remove an exercise from a patient
 */
router.delete('/patient/:patientExId', authenticateToken, exerciseCatalogController.handleRemovePatientExercise);

/**
 * POST /api/exercise-catalogs/adherence/log
 * Log exercise adherence
 */
router.post('/adherence/log', authenticateToken, exerciseCatalogController.handleLogAdherence);

/**
 * GET /api/exercise-catalogs/adherence/:patientId
 * Get adherence stats for a patient
 */
router.get('/adherence/:patientId', authenticateToken, exerciseCatalogController.handleGetAdherence);

export default router;
