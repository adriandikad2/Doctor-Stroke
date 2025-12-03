import express from 'express';
import * as appointmentController from '../controllers/appointment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/appointments/slots/all
 * Get all appointment slots (admin/testing endpoint)
 */
router.get('/slots/all', authenticateToken, appointmentController.handleGetAllSlots);

/**
 * GET /api/appointments/all
 * Get all appointments (admin/testing endpoint)
 */
router.get('/all', authenticateToken, appointmentController.handleGetAllAppointments);

/**
 * POST /api/appointments/slots
 * Create a new availability slot (doctor/therapist only)
 */
router.post('/slots', authenticateToken, appointmentController.handleCreateSlot);

/**
 * GET /api/appointments/slots/:medicalUserId
 * Get available slots for a medical user
 */
router.get('/slots/:medicalUserId', authenticateToken, appointmentController.handleGetAvailableSlots);

/**
 * POST /api/appointments/book
 * Book an appointment (family member only)
 */
router.post('/book', authenticateToken, appointmentController.handleBookAppointment);

/**
 * POST /api/appointments/book-direct
 * Create a direct appointment (doctor/therapist only)
 */
router.post('/book-direct', authenticateToken, appointmentController.handleDirectBooking);

/**
 * GET /api/appointments/patient/:patientId
 * Get appointments for a patient
 */
router.get('/patient/:patientId', authenticateToken, appointmentController.handleGetAppointmentsByPatient);

/**
 * GET /api/appointments/me
 * Get all appointments booked by the authenticated user
 */
router.get('/me', authenticateToken, appointmentController.handleGetMyAppointments);

/**
 * GET /api/appointments/my-slots
 * Get all slots created by the authenticated medical user
 */
router.get('/my-slots', authenticateToken, appointmentController.handleGetMySlots);

export default router;
