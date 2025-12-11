import express from 'express';
import {
  recordSnapshot,
  getSnapshots,
  getProgressReport,
  getPredictiveAlerts,
  logVitals,
  getVitalsTrends,
  getHealthTrendAnalysis
} from '../controllers/progress.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Legacy routes
router.post('/', authenticateToken, recordSnapshot);
router.get('/patient/:patientId/report', authenticateToken, getProgressReport);
router.get('/patient/:patientId/alerts', authenticateToken, getPredictiveAlerts);
router.get('/patient/:patientId', authenticateToken, getSnapshots);

// New vitals routes
/**
 * POST /api/progress/vitals
 * Log daily vital signs
 */
router.post('/vitals', authenticateToken, logVitals);

/**
 * GET /api/progress/vitals/:patientId
 * Get vital signs trends
 */
router.get('/vitals/:patientId', authenticateToken, getVitalsTrends);

/**
 * GET /api/progress/analysis/:patientId
 * Get overall health trend analysis
 */
router.get('/analysis/:patientId', authenticateToken, getHealthTrendAnalysis);

export default router;
