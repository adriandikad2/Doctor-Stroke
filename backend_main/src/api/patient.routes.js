const express = require('express');
const { handleCreatePatient, handleGetMyPatients } = require('../controllers/patient.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const router = express.Router();

// POST / - Create a new patient (protected route)
router.post('/', authenticateToken, handleCreatePatient);

// GET / - Get my patients (protected route)
router.get('/', authenticateToken, handleGetMyPatients);

module.exports = router;
