import express from 'express';
import * as patientController from '../controllers/patient.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/patients/all
 * Get all patient profiles (admin/testing endpoint)
 */
router.get('/all', authenticateToken, patientController.handleGetAllPatientProfiles);

/**
 * POST /api/patients/
 * Create a new patient profile (family members only)
 */
router.post('/', authenticateToken, patientController.handleCreatePatient);

/**
 * POST /api/patients/link
 * Link a medical team member to an existing patient
 */
router.post('/link', authenticateToken, patientController.handleLinkPatient);

/**
 * GET /api/patients/me
 * Get all patients linked to the authenticated user (Dashboard)
 */
router.get('/me', authenticateToken, patientController.handleGetMyPatients);

/**
 * GET /api/patients/:id
 * Get a specific patient by ID (access control applied)
 */
router.get('/:id', authenticateToken, patientController.handleGetPatientById);

/**
 * PUT /api/patients/:id
 * Update a patient profile (family members only)
 */
router.put('/:id', authenticateToken, patientController.handleUpdatePatient);

/**
 * DELETE /api/patients/:id
 * Delete a patient profile (family members only)
 */
router.delete('/:id', authenticateToken, patientController.handleDeletePatient);

export default router;
