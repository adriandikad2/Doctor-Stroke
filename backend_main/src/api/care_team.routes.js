import express from 'express';
import * as careTeamController from '../controllers/care_team.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/care-team/all
 * Get all care team links (admin/testing endpoint)
 */
router.get('/all', authenticateToken, careTeamController.handleGetAllCareTeamLinks);

/**
 * GET /api/care-team/:patientId
 * Get care team for a patient
 */
router.get('/:patientId', authenticateToken, careTeamController.handleGetTeam);

/**
 * DELETE /api/care-team/:linkId
 * Remove a member from care team
 */
router.delete('/:linkId', authenticateToken, careTeamController.handleRemoveMember);

export default router;
