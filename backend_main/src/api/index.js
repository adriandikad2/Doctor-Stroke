const express = require('express');
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const appointmentRoutes = require('./appointment.routes');
const logRoutes = require('./log.routes');
const medicationRoutes = require('./medication.routes');
const prescriptionRoutes = require('./prescription.routes');
const progressRoutes = require('./progress.routes');
const nutritionRoutes = require('./nutrition.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/logs', logRoutes);
router.use('/medications', medicationRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/progress', progressRoutes);
router.use('/nutrition', nutritionRoutes);

module.exports = router;
