const nutritionService = require('../services/nutrition.service');

const upsertProfile = async (req, res) => {
  try {
    const profile = await nutritionService.saveNutritionProfile(
      req.params.patientId,
      req.body,
      req.user,
    );

    res.status(200).json({
      message: 'Update Nutrition Profile Successful',
      profile,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await nutritionService.getNutritionProfile(
      req.params.patientId,
      req.user,
    );

    res.status(200).json({
      profile,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const generatePlan = async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days, 10) : 7;
    const plan = await nutritionService.generateDietPlan(
      req.params.patientId,
      req.user,
      days,
    );

    res.status(200).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logMeal = async (req, res) => {
  try {
    const result = await nutritionService.logMeal(
      req.params.patientId,
      req.body,
      req.user,
    );

    res.status(201).json({
      message: 'Meal logged successfully',
      ...result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const listMeals = async (req, res) => {
  try {
    const meals = await nutritionService.listMeals(
      req.params.patientId,
      req.user,
      {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      },
    );

    res.status(200).json({
      meals,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  upsertProfile,
  getProfile,
  generatePlan,
  logMeal,
  listMeals,
};
