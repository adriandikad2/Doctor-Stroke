import express from 'express';
import authRoutes from './auth.routes.js';
import patientRoutes from './patient.routes.js';
import appointmentRoutes from './appointment.routes.js';
import prescriptionRoutes from './prescription.routes.js';
import medicationRoutes from './medication.routes.js';
import medicationCatalogRoutes from './medication-catalog.routes.js';
import nutritionRoutes from './nutrition.routes.js';
import nutritionCatalogRoutes from './nutrition-catalog.routes.js';
import exerciseRoutes from './exercise.routes.js';
import exerciseCatalogRoutes from './exercise-catalog.routes.js';
import progressRoutes from './progress.routes.js';
import logRoutes from './log.routes.js';
import adherenceRoutes from './adherence.routes.js';
import careTeamRoutes from './care_team.routes.js';
import userRoutes from './user.routes.js';
import insightRoutes from './insight.routes.js';

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
 * Mount medication routes
 */
router.use('/medications', medicationRoutes);
router.use('/medication-catalogs', medicationCatalogRoutes);

/**
 * Mount nutrition routes
 */
router.use('/nutrition', nutritionRoutes);
router.use('/nutrition-catalogs', nutritionCatalogRoutes);

/**
 * Mount exercise routes
 */
router.use('/exercises', exerciseRoutes);
router.use('/exercise-catalogs', exerciseCatalogRoutes);

/**
 * Mount progress routes
 */
router.use('/progress', progressRoutes);

/**
 * Mount logging routes
 */
router.use('/logs', logRoutes);

/**
 * Mount adherence routes
 */
router.use('/logs', adherenceRoutes);

/**
 * Mount care team routes
 */
router.use('/care-team', careTeamRoutes);

/**
 * Mount insight routes
 */
router.use('/insights', insightRoutes);

/**
 * Mount user routes
 */
router.use('/users', userRoutes);

export default router;
