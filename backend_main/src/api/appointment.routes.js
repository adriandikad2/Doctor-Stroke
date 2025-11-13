const express = require('express');
const { handleCreateAppointment, handleGetMyAppointments } = require('../controllers/appointment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const router = express.Router();

// POST / - Create a new appointment (protected route)
router.post('/', authenticateToken, handleCreateAppointment);

// GET / - Get my appointments (protected route)
router.get('/', authenticateToken, handleGetMyAppointments);

module.exports = router;
