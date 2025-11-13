const express = require('express');
const {
  upsertProfile,
  getProfile,
  generatePlan,
  logMeal,
  listMeals,
} = require('../controllers/nutrition.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.put('/patient/:patientId/profile', authenticateToken, upsertProfile);
router.get('/patient/:patientId/profile', authenticateToken, getProfile);
router.get('/patient/:patientId/plan', authenticateToken, generatePlan);
router.post('/patient/:patientId/meals', authenticateToken, logMeal);
router.get('/patient/:patientId/meals', authenticateToken, listMeals);

module.exports = router;
