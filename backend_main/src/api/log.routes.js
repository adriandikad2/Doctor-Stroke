import express from 'express';
import * as logController from '../controllers/log.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Progress Logs Routes
 */

/**
 * GET /api/logs/progress/all
 * Get all progress logs (admin/testing endpoint)
 */
router.get('/progress/all', authenticateToken, logController.handleGetAllProgressLogs);

/**
 * POST /api/logs/progress
 * Create a new progress log entry
 */
router.post('/progress', authenticateToken, logController.handleCreateProgressLog);

/**
 * GET /api/logs/progress/:patientId
 * Get all progress logs for a patient
 */
router.get('/progress/:patientId', authenticateToken, logController.handleGetProgressLogs);

/**
 * PUT /api/logs/progress/:logId
 * Update a progress log (owner only)
 */
router.put('/progress/:logId', authenticateToken, logController.handleUpdateProgressLog);

/**
 * DELETE /api/logs/progress/:logId
 * Delete a progress log (owner only)
 */
router.delete('/progress/:logId', authenticateToken, logController.handleDeleteProgressLog);

/**
 * Meal Logs Routes
 */

/**
 * GET /api/logs/meal/all
 * Get all meal logs (admin/testing endpoint)
 */
router.get('/meal/all', authenticateToken, logController.handleGetAllMealLogs);

/**
 * POST /api/logs/meal
 * Create a new meal log entry
 */
router.post('/meal', authenticateToken, logController.handleCreateMealLog);

/**
 * GET /api/logs/meal/:patientId
 * Get all meal logs for a patient
 */
router.get('/meal/:patientId', authenticateToken, logController.handleGetMealLogs);

/**
 * PUT /api/logs/meal/:logId
 * Update a meal log (owner only)
 */
router.put('/meal/:logId', authenticateToken, logController.handleUpdateMealLog);

/**
 * DELETE /api/logs/meal/:logId
 * Delete a meal log (owner only)
 */
router.delete('/meal/:logId', authenticateToken, logController.handleDeleteMealLog);

/**
 * Medication Adherence Logs Routes
 */

/**
 * GET /api/logs/adherence/all
 * Get all medication adherence logs (admin/testing endpoint)
 */
router.get('/adherence/all', authenticateToken, logController.handleGetAllAdherenceLogs);

/**
 * POST /api/logs/adherence
 * Create a new medication adherence log entry
 */
router.post('/adherence', authenticateToken, logController.handleCreateAdherenceLog);

/**
 * GET /api/logs/adherence/:patientId
 * Get all medication adherence logs for a patient
 */
router.get('/adherence/:patientId', authenticateToken, logController.handleGetAdherenceLogs);

/**
 * PUT /api/logs/adherence/:logId
 * Update a medication adherence log (owner only)
 */
router.put('/adherence/:logId', authenticateToken, logController.handleUpdateAdherenceLog);

/**
 * DELETE /api/logs/adherence/:logId
 * Delete a medication adherence log (owner only)
 */
router.delete('/adherence/:logId', authenticateToken, logController.handleDeleteAdherenceLog);

/**
 * Patient Progress Snapshots Routes
 */

/**
 * GET /api/logs/snapshot/all
 * Get all patient progress snapshots (admin/testing endpoint)
 */
router.get('/snapshot/all', authenticateToken, logController.handleGetAllSnapshotLogs);

/**
 * POST /api/logs/snapshot
 * Create a new patient progress snapshot
 */
router.post('/snapshot', authenticateToken, logController.handleCreateSnapshotLog);

/**
 * GET /api/logs/snapshot/:patientId
 * Get all patient progress snapshots
 */
router.get('/snapshot/:patientId', authenticateToken, logController.handleGetSnapshotLogs);

/**
 * PUT /api/logs/snapshot/:snapshotId
 * Update a patient progress snapshot (owner only)
 */
router.put('/snapshot/:snapshotId', authenticateToken, logController.handleUpdateSnapshotLog);

/**
 * DELETE /api/logs/snapshot/:snapshotId
 * Delete a patient progress snapshot (owner only)
 */
router.delete('/snapshot/:snapshotId', authenticateToken, logController.handleDeleteSnapshotLog);

export default router;
