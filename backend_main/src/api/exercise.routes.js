import express from 'express';
import {
  handleGetPatientExercises,
  handleLogAdherence,
  handleGetAdherence,
} from '../controllers/exercise-catalog.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Proxy routes for exercise adherence and assignments (backward compatibility)
 */

// GET /api/exercises/patient/:patientId
router.get('/patient/:patientId', authenticateToken, handleGetPatientExercises);

// POST /api/exercises/adherence/log
router.post('/adherence/log', authenticateToken, handleLogAdherence);

// GET /api/exercises/adherence/:patientId
router.get('/adherence/:patientId', authenticateToken, handleGetAdherence);

export default router;
