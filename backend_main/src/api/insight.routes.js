import express from 'express';
import { handleGetPatientSummary } from '../controllers/insight.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/insights/patient/:patientId/summary
 * Mengembalikan ringkasan AI untuk pasien tertentu.
 */
router.get(
  '/patient/:patientId/summary',
  authenticateToken,
  handleGetPatientSummary
);

export default router;