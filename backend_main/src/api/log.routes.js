const express = require('express');
const { 
  handleCreateLog, 
  handleGetLogsForPatient, 
  handleUpdateLog, 
  handleDeleteLog 
} = require('../controllers/log.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const router = express.Router();

// POST / - Create a new progress log (protected route)
router.post('/', authenticateToken, handleCreateLog);

// GET /:patientId - Get all logs for a patient (protected route)
router.get('/:patientId', authenticateToken, handleGetLogsForPatient);

// PUT /:logId - Update a progress log (protected route)
router.put('/:logId', authenticateToken, handleUpdateLog);

// DELETE /:logId - Delete a progress log (protected route)
router.delete('/:logId', authenticateToken, handleDeleteLog);

module.exports = router;
