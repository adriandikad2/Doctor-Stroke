const express = require('express');
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const appointmentRoutes = require('./appointment.routes');
const logRoutes = require('./log.routes');
const medicationRoutes = require('./medication.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/logs', logRoutes);
router.use('/medications', medicationRoutes);

module.exports = router;
