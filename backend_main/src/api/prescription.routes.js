const express = require('express');
const {
  createPrescription,
  updatePrescription,
  getPrescriptionsForPatient,
  updatePrescriptionStatus,
  logAdherenceEvent,
  getAdherenceSummary,
  checkMedicationInteractions,
  getUpcomingReminders,
} = require('../controllers/prescription.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticateToken, createPrescription);
router.put('/:prescriptionId', authenticateToken, updatePrescription);
router.patch('/:prescriptionId/status', authenticateToken, updatePrescriptionStatus);
router.get('/patient/:patientId', authenticateToken, getPrescriptionsForPatient);

router.post('/:prescriptionId/adherence', authenticateToken, logAdherenceEvent);
router.get('/:prescriptionId/adherence', authenticateToken, getAdherenceSummary);
router.get('/:prescriptionId/reminders', authenticateToken, getUpcomingReminders);

router.post('/interactions/check', authenticateToken, checkMedicationInteractions);

module.exports = router;
