import * as nutritionService from '../services/nutrition.service.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Handle getting nutrition profile for a patient
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetProfile = async (req, res) => {
  try {
    const { patientId } = req.params;

    const profile = await nutritionService.getProfile(patientId);

    res.status(200).json({
      success: true,
      message: 'Profil nutrisi berhasil diambil',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil profil nutrisi',
    });
  }
};

/**
 * Handle updating nutrition profile for a patient
 * @param {object} req - Express request object with user, params, and body
 * @param {object} res - Express response object
 */
export const handleUpdateProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = req.body;
    const user = req.user;

    const updatedProfile = await nutritionService.updateProfile(patientId, data, user);

    res.status(200).json({
      success: true,
      message: 'Profil nutrisi berhasil diperbarui',
      data: updatedProfile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memperbarui profil nutrisi',
    });
  }
};

/**
 * Handle getting all nutrition profiles
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllProfiles = async (req, res) => {
  try {
    const profiles = await nutritionService.getAllProfiles();

    res.status(200).json({
      success: true,
      message: 'Semua profil nutrisi berhasil diambil',
      data: profiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil profil nutrisi',
    });
  }
};

/**
 * Handle getting nutrition feedback for a patient's daily meals
 * @param {object} req 
 * @param {object} res 
 */
export const handleGetMealFeedback = async (req, res) => {
  try {
    const { patientId } = req.params;

    const feedback = await nutritionService.getMealFeedback(patientId);

    res.status(200).json({
      success: true,
      message: 'Feedback nutrition achieved successfully',
      data: feedback,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get nutrition feedback',
    });
  }
};

// ===== NEW CATALOG FUNCTIONS =====

/**
 * GET /api/nutrition/catalog
 * Get all nutrition items from catalog (optionally filtered by category)
 */
export const handleGetNutritionCatalog = async (req, res) => {
  try {
    const { category } = req.query;

    const where = {};
    if (category) {
      where.category = category;
    }

    const foods = await prisma.nutrition_catalog.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: foods,
      count: foods.length
    });
  } catch (error) {
    console.error('Error fetching nutrition catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nutrition catalog',
      error: error.message
    });
  }
};

/**
 * GET /api/nutrition/catalog/:catalogId
 * Get nutrition item detail from catalog
 */
export const handleGetNutritionDetail = async (req, res) => {
  try {
    const { catalogId } = req.params;

    const food = await prisma.nutrition_catalog.findUnique({
      where: { catalog_id: catalogId }
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Error fetching nutrition detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nutrition detail',
      error: error.message
    });
  }
};

/**
 * POST /api/nutrition/meal-plan
 * Doctor creates meal plan for patient with nutrition items
 */
export const handleCreateMealPlan = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { patientId, catalogId, startDate, endDate } = req.body;

    // Validate required fields
    if (!patientId || !catalogId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, catalogId, startDate'
      });
    }

    // Verify doctor/therapist can create meal plan for this patient
    const careTeam = await prisma.patient_care_team.findUnique({
      where: {
        user_id_patient_id: {
          user_id: userId,
          patient_id: patientId
        }
      }
    });

    if (!careTeam) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create meal plan for this patient'
      });
    }

    // Verify catalog exists
    const catalogItem = await prisma.nutrition_catalog.findUnique({
      where: { catalog_id: catalogId }
    });

    if (!catalogItem) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition catalog item not found'
      });
    }

    // Create meal plan
    const mealPlan = await prisma.patient_meal_plans.create({
      data: {
        patient_id: patientId,
        catalog_id: catalogId,
        assigned_by_user_id: userId,
        start_date: new Date(startDate).toISOString().split('T')[0],
        end_date: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
        is_active: true
      },
      include: {
        catalog: true,
        assigned_by: {
          select: {
            user_id: true,
            email: true,
            doctor_profile: true,
            therapist_profile: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Meal plan created successfully',
      data: mealPlan
    });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meal plan',
      error: error.message
    });
  }
};

/**
 * GET /api/nutrition/patient/:patientId
 * Get all meal plans for a patient
 */
export const handleGetPatientMealPlans = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { activeOnly } = req.query;

    const where = { patient_id: patientId };
    if (activeOnly === 'true') {
      where.is_active = true;
    }

    const mealPlans = await prisma.patient_meal_plans.findMany({
      where,
      include: {
        catalog: true,
        assigned_by: {
          select: {
            email: true,
            doctor_profile: true,
            therapist_profile: true
          }
        },
        meal_logs: {
          orderBy: { created_at: 'desc' },
          take: 10
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: mealPlans,
      count: mealPlans.length
    });
  } catch (error) {
    console.error('Error fetching patient meal plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient meal plans',
      error: error.message
    });
  }
};

/**
 * POST /api/nutrition/meal-log
 * Family logs meal consumption
 */
export const handleLogMeal = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { patientId, mealPlanId, status, notes, scheduledDate, loggedDate } = req.body;

    if (!patientId || !mealPlanId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, mealPlanId, status'
      });
    }

    // Verify the meal plan exists and belongs to the patient
    const mealPlan = await prisma.patient_meal_plans.findUnique({
      where: { meal_plan_id: mealPlanId }
    });

    if (!mealPlan || mealPlan.patient_id !== patientId) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found for this patient'
      });
    }

    // Create meal log
    const mealLog = await prisma.nutrition_meal_logs.create({
      data: {
        meal_plan_id: mealPlanId,
        patient_id: patientId,
        logged_by_user_id: userId,
        status,
        scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString().split('T')[0] : null,
        logged_date: loggedDate ? new Date(loggedDate) : null,
        notes: notes || null
      },
      include: {
        meal_plan: {
          include: { catalog: true }
        },
        logged_by: {
          select: { email: true, family_profile: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Meal log created successfully',
      data: mealLog
    });
  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log meal',
      error: error.message
    });
  }
};

/**
 * GET /api/nutrition/meal-logs/:patientId
 * Get all meal logs for a patient (for doctor view)
 */
export const handleGetMealLogs = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get meal logs with meal plan info
    const mealLogs = await prisma.nutrition_meal_logs.findMany({
      where: {
        patient_id: patientId,
        created_at: { gte: startDate }
      },
      include: {
        meal_plan: {
          include: { catalog: true }
        },
        logged_by: {
          select: { email: true, family_profile: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Get patient meal plans for context
    const mealPlans = await prisma.patient_meal_plans.findMany({
      where: {
        patient_id: patientId,
        is_active: true
      },
      include: { catalog: true }
    });

    // Calculate adherence stats by meal type
    const adherenceByFood = {};
    mealLogs.forEach(log => {
      const foodName = log.meal_plan.catalog.name;
      if (!adherenceByFood[foodName]) {
        adherenceByFood[foodName] = {
          foodName,
          category: log.meal_plan.catalog.category,
          mealTime: log.meal_plan.catalog.meal_time,
          totalLogs: 0,
          takenLogs: 0,
          missedLogs: 0,
          adherenceRate: 0
        };
      }
      adherenceByFood[foodName].totalLogs += 1;
      if (log.status === 'taken') {
        adherenceByFood[foodName].takenLogs += 1;
      } else {
        adherenceByFood[foodName].missedLogs += 1;
      }
      adherenceByFood[foodName].adherenceRate = 
        ((adherenceByFood[foodName].takenLogs / adherenceByFood[foodName].totalLogs) * 100).toFixed(2);
    });

    // Calculate overall nutrition adherence
    const totalLogs = mealLogs.length;
    const takenLogs = mealLogs.filter(log => log.status === 'taken').length;
    const overallAdherence = totalLogs > 0 ? ((takenLogs / totalLogs) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        patientId,
        overallAdherence: parseFloat(overallAdherence),
        adherenceByFood: Object.values(adherenceByFood),
        activeMealPlans: mealPlans.length,
        totalLogsInPeriod: totalLogs,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching meal logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal logs',
      error: error.message
    });
  }
};

/**
 * PUT /api/nutrition/:mealPlanId
 * Update patient meal plan
 */
export const handleUpdateMealPlan = async (req, res) => {
  try {
    const { mealPlanId } = req.params;
    const { endDate, isActive } = req.body;

    const updateData = {};
    if (endDate !== undefined) updateData.end_date = endDate;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date();

    const updatedPlan = await prisma.patient_meal_plans.update({
      where: { meal_plan_id: mealPlanId },
      data: updateData,
      include: {
        catalog: true,
        assigned_by: {
          select: { email: true, doctor_profile: true, therapist_profile: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Meal plan updated successfully',
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meal plan',
      error: error.message
    });
  }
};

/**
 * DELETE /api/nutrition/:mealPlanId
 * Delete meal plan (soft delete by setting is_active to false)
 */
export const handleDeleteMealPlan = async (req, res) => {
  try {
    const { mealPlanId } = req.params;

    const deletedPlan = await prisma.patient_meal_plans.update({
      where: { meal_plan_id: mealPlanId },
      data: { is_active: false, updated_at: new Date() },
      include: { catalog: true }
    });

    res.status(200).json({
      success: true,
      message: 'Meal plan deleted successfully',
      data: deletedPlan
    });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meal plan',
      error: error.message
    });
  }
};
