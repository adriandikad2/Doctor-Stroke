const express = require('express');
const { 
  handleCreateSchedule, 
  handleGetSchedules, 
  handleUpdateSchedule, 
  handleDeleteSchedule 
} = require('../controllers/medication.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const router = express.Router();

// POST / - Create a new medication schedule (protected route)
router.post('/', authenticateToken, handleCreateSchedule);

// GET /:patientId - Get all medication schedules for a patient (protected route)
router.get('/:patientId', authenticateToken, handleGetSchedules);

// PUT /:scheduleId - Update a medication schedule (protected route)
router.put('/:scheduleId', authenticateToken, handleUpdateSchedule);

// DELETE /:scheduleId - Delete a medication schedule (protected route)
router.delete('/:scheduleId', authenticateToken, handleDeleteSchedule);

module.exports = router;
