import express from 'express';
import { 
  handleCreateSchedule, 
  handleGetSchedules, 
  handleUpdateSchedule, 
  handleDeleteSchedule,
  handleGetMedicationCatalog,
  handleGetMedicationDetail,
  handlePrescribeMedication,
  handleGetPatientMedications,
  handleLogMedicationAdherence,
  handleGetMedicationAdherence,
  handleUpdatePatientMedication,
  handleDeletePatientMedication
} from '../controllers/medication.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// ===== NEW CATALOG ROUTES =====
/**
 * GET /api/medications/catalog
 * Get all medications from catalog
 */
router.get('/catalog', authenticateToken, handleGetMedicationCatalog);

/**
 * GET /api/medications/catalog/:catalogId
 * Get medication detail from catalog
 */
router.get('/catalog/:catalogId', authenticateToken, handleGetMedicationDetail);

/**
 * POST /api/medications/prescribe
 * Doctor prescribes medication from catalog to patient
 */
router.post('/prescribe', authenticateToken, handlePrescribeMedication);

/**
 * GET /api/medications/patient/:patientId
 * Get all medications for a patient
 */
router.get('/patient/:patientId', authenticateToken, handleGetPatientMedications);

/**
 * POST /api/medications/adherence/log
 * Family logs medication adherence
 */
router.post('/adherence/log', authenticateToken, handleLogMedicationAdherence);

/**
 * GET /api/medications/adherence/:patientId
 * Get medication adherence data for patient (for doctor view)
 */
router.get('/adherence/:patientId', authenticateToken, handleGetMedicationAdherence);

/**
 * PUT /api/medications/:patientMedId
 * Update patient medication
 */
router.put('/:patientMedId', authenticateToken, handleUpdatePatientMedication);

/**
 * DELETE /api/medications/:patientMedId
 * Delete patient medication
 */
router.delete('/:patientMedId', authenticateToken, handleDeletePatientMedication);

// ===== LEGACY ROUTES (kept for backward compatibility) =====
router.post('/', authenticateToken, handleCreateSchedule);
router.get('/:patientId', authenticateToken, handleGetSchedules);
router.put('/:scheduleId', authenticateToken, handleUpdateSchedule);
router.delete('/:scheduleId', authenticateToken, handleDeleteSchedule);

export default router;
