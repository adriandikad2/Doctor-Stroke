const express = require('express');
const {
  recordSnapshot,
  getSnapshots,
  getProgressReport,
  getPredictiveAlerts,
} = require('../controllers/progress.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticateToken, recordSnapshot);
router.get('/patient/:patientId/report', authenticateToken, getProgressReport);
router.get('/patient/:patientId/alerts', authenticateToken, getPredictiveAlerts);
router.get('/patient/:patientId', authenticateToken, getSnapshots);

module.exports = router;
