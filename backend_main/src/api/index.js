import express from 'express';
import authRoutes from './auth.routes.js';
import patientRoutes from './patient.routes.js';
import appointmentRoutes from './appointment.routes.js';
import prescriptionRoutes from './prescription.routes.js';
import nutritionRoutes from './nutrition.routes.js';
import logRoutes from './log.routes.js';
import careTeamRoutes from './care_team.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

/**
 * Mount authentication routes
 */
router.use('/auth', authRoutes);

/**
 * Mount patient routes
 */
router.use('/patients', patientRoutes);

/**
 * Mount appointment routes
 */
router.use('/appointments', appointmentRoutes);

/**
 * Mount prescription routes
 */
router.use('/prescriptions', prescriptionRoutes);

/**
 * Mount nutrition routes
 */
router.use('/nutrition', nutritionRoutes);

/**
 * Mount logging routes
 */
router.use('/logs', logRoutes);

/**
 * Mount care team routes
 */
router.use('/care-team', careTeamRoutes);

/**
 * Mount user routes
 */
router.use('/users', userRoutes);

export default router;
