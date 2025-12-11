import express from 'express';
import * as medicationCatalogController from '../controllers/medication-catalog.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/medication-catalogs/all
 * Get all medication catalogs (admin/testing endpoint)
 */
router.get('/all', authenticateToken, medicationCatalogController.handleGetAllCatalogs);

/**
 * POST /api/medication-catalogs
 * Create a new medication catalog (admin only)
 */
router.post('/', authenticateToken, medicationCatalogController.handleCreateCatalog);

/**
 * GET /api/medication-catalogs/:catalogId
 * Get a specific medication catalog
 */
router.get('/:catalogId', authenticateToken, medicationCatalogController.handleGetCatalogById);

/**
 * PUT /api/medication-catalogs/:catalogId
 * Update a medication catalog (admin only)
 */
router.put('/:catalogId', authenticateToken, medicationCatalogController.handleUpdateCatalog);

/**
 * DELETE /api/medication-catalogs/:catalogId
 * Delete a medication catalog (admin only)
 */
router.delete('/:catalogId', authenticateToken, medicationCatalogController.handleDeleteCatalog);

/**
 * POST /api/medication-catalogs/:catalogId/assign
 * Assign a medication catalog to a patient (doctor only)
 */
router.post('/:catalogId/assign', authenticateToken, medicationCatalogController.handleAssignToPatient);

/**
 * GET /api/medication-catalogs/patient/:patientId
 * Get all medications assigned to a patient
 */
router.get('/patient/:patientId', authenticateToken, medicationCatalogController.handleGetPatientMedications);

/**
 * DELETE /api/medication-catalogs/patient/:patientMedId
 * Remove a medication from a patient
 */
router.delete('/patient/:patientMedId', authenticateToken, medicationCatalogController.handleRemovePatientMedication);

/**
 * POST /api/medication-catalogs/adherence/log
 * Log medication adherence status
 */
router.post('/adherence/log', authenticateToken, medicationCatalogController.handleLogAdherence);

/**
 * GET /api/medication-catalogs/adherence/:patientId
 * Get medication adherence stats
 */
router.get('/adherence/:patientId', authenticateToken, medicationCatalogController.handleGetAdherence);

export default router;
