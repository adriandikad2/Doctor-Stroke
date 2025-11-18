import express from 'express';
import * as prescriptionController from '../controllers/prescription.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/prescriptions/all
 * Get all prescriptions (admin/testing endpoint)
 */
router.get('/all', authenticateToken, prescriptionController.handleGetAllPrescriptions);

/**
 * POST /api/prescriptions/
 * Create a new prescription (doctor only)
 */
router.post('/', authenticateToken, prescriptionController.handleCreate);

/**
 * GET /api/prescriptions/:patientId
 * Get all prescriptions for a patient
 */
router.get('/:patientId', authenticateToken, prescriptionController.handleGetByPatientId);

/**
 * PUT /api/prescriptions/:prescriptionId
 * Update a prescription (doctor only)
 */
router.put('/:prescriptionId', authenticateToken, prescriptionController.handleUpdate);

/**
 * DELETE /api/prescriptions/:prescriptionId
 * Delete a prescription (doctor only)
 */
router.delete('/:prescriptionId', authenticateToken, prescriptionController.handleDelete);

export default router;
