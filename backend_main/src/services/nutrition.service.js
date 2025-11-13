const nutritionRepository = require('../repositories/nutrition.repository');
const patientRepository = require('../repositories/patient.repository');

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_LIBRARY = {
  breakfast: [
    {
      title: 'Oatmeal with berries and flaxseed',
      description: 'Oatmeal with fresh berries, flaxseed, and unsweetened almond milk.',
      sodium_mg: 150,
      fiber_g: 8,
      calories: 320,
    },
    {
      title: 'Green smoothie',
      description: 'Spinach, banana, chia seeds, and low-fat yogurt.',
      sodium_mg: 120,
      fiber_g: 7,
      calories: 280,
    },
    {
      title: 'Whole wheat toast with egg',
      description: 'Whole grain bread with avocado and boiled egg without added salt.',
      sodium_mg: 210,
      fiber_g: 6,
      calories: 350,
    },
  ],
  lunch: [
    {
      title: 'Quinoa salad with steamed chicken',
      description: 'Quinoa, steamed chicken breast, leafy greens, olive oil.',
      sodium_mg: 260,
      fiber_g: 9,
      calories: 450,
    },
    {
      title: 'Low-sodium red bean soup',
      description: 'Red bean soup with whole grain bread.',
      sodium_mg: 320,
      fiber_g: 11,
      calories: 420,
    },
    {
      title: 'Steamed fish with vegetables',
      description: 'Steamed sea bass with roasted broccoli and carrots.',
      sodium_mg: 290,
      fiber_g: 7,
      calories: 430,
    },
  ],
  dinner: [
    {
      title: 'Stir-fried tofu with ginger',
      description: 'Tofu, mushrooms, and bok choy lightly stir-fried with canola oil.',
      sodium_mg: 230,
      fiber_g: 6,
      calories: 380,
    },
    {
      title: 'Savory oatmeal porridge',
      description: 'Savory oat porridge with peas and carrots.',
      sodium_mg: 210,
      fiber_g: 8,
      calories: 360,
    },
    {
      title: 'Baked salmon with vegetables',
      description: 'Baked salmon with asparagus and steamed potato.',
      sodium_mg: 280,
      fiber_g: 5,
      calories: 410,
    },
  ],
  snack: [
    {
      title: 'Fresh fruit and unsalted nuts',
      description: 'Apple or pear with unsalted almonds.',
      sodium_mg: 30,
      fiber_g: 4,
      calories: 180,
    },
    {
      title: 'Probiotic yogurt',
      description: 'Low-fat yogurt with chia seeds.',
      sodium_mg: 70,
      fiber_g: 3,
      calories: 150,
    },
    {
      title: 'Papaya ginger smoothie',
      description: 'Papaya, ginger, lime juice without added sugar.',
      sodium_mg: 40,
      fiber_g: 3,
      calories: 160,
    },
  ],
};

const ensurePatientLink = async (user, patient_id) => {
  if (user.role === 'admin') {
    return true;
  }

  const isLinked = await patientRepository.isUserLinkedToPatient(user.userId, patient_id);
  if (!isLinked) {
    throw new Error('You do not have access to this patient.');
  }
  return true;
};

const saveNutritionProfile = async (patient_id, payload, user) => {
  await ensurePatientLink(user, patient_id);

  if (!payload.sodium_limit_mg || !payload.fiber_target_g) {
    throw new Error('Sodium limit and fiber target are required.');
  }

  return nutritionRepository.upsertNutritionProfile({
    patient_id,
    calorie_target_min: payload.calorie_target_min || 1400,
    calorie_target_max: payload.calorie_target_max || 1800,
    sodium_limit_mg: payload.sodium_limit_mg,
    fiber_target_g: payload.fiber_target_g,
    fluid_limit_ml: payload.fluid_limit_ml || 2000,
    updated_by: user.userId,
  });
};

const getNutritionProfile = async (patient_id, user) => {
  await ensurePatientLink(user, patient_id);
  return nutritionRepository.getNutritionProfile(patient_id);
};

const buildMealPlan = (profile, days) => {
  const start = new Date();
  const plan = [];

  for (let i = 0; i < days; i += 1) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);

    const meals = {};

    MEAL_TYPES.forEach((type) => {
      const options = MEAL_LIBRARY[type];
      const index = (i + MEAL_TYPES.indexOf(type)) % options.length;
      meals[type] = options[index];
    });

    plan.push({
      day: dayDate.toISOString().split('T')[0],
      targets: {
        calorie_range: [profile?.calorie_target_min || 1400, profile?.calorie_target_max || 1800],
        sodium_limit_mg: profile?.sodium_limit_mg || 1500,
        fiber_target_g: profile?.fiber_target_g || 25,
      },
      meals,
    });
  }

  return plan;
};

const generateDietPlan = async (patient_id, user, days = 7) => {
  const profile = await getNutritionProfile(patient_id, user);
  return {
    profile,
    plan: buildMealPlan(profile, days),
  };
};

const evaluateMealAgainstProfile = (totals, profile) => {
  if (!profile) {
    return {
      status: 'info',
      notes: ['Nutrition profile not yet configured, using default values.'],
      totals,
    };
  }

  const warnings = [];

  if (totals.sodium_mg > profile.sodium_limit_mg) {
    warnings.push('Daily sodium intake exceeds recommended limit.');
  }

  if (totals.fiber_g < profile.fiber_target_g) {
    warnings.push('Daily fiber intake is below target. Add more vegetables and fruits.');
  }

  if (totals.calories < profile.calorie_target_min) {
    warnings.push('Total calories are below minimum target.');
  } else if (totals.calories > profile.calorie_target_max) {
    warnings.push('Total calories exceed maximum target.');
  }

  return {
    status: warnings.length ? 'warning' : 'ok',
    notes: warnings,
    totals,
    profile,
  };
};

const logMeal = async (patient_id, payload, user) => {
  await ensurePatientLink(user, patient_id);

  if (!MEAL_TYPES.includes(payload.meal_type)) {
    throw new Error('Invalid meal type.');
  }

  const profile = await nutritionRepository.getNutritionProfile(patient_id);
  const loggedFor = payload.logged_for || new Date().toISOString().split('T')[0];
  const totalsBefore = await nutritionRepository.getDailyTotals(
    patient_id,
    loggedFor,
  );

  const totalsAfter = {
    calories: Number(totalsBefore.calories || 0) + (payload.calories || 0),
    sodium_mg: Number(totalsBefore.sodium_mg || 0) + (payload.sodium_mg || 0),
    fiber_g: Number(totalsBefore.fiber_g || 0) + (payload.fiber_g || 0),
  };

  const feedback = evaluateMealAgainstProfile(totalsAfter, profile);

  const saved = await nutritionRepository.logMeal({
    meal_id: null,
    patient_id,
    logged_by: user.userId,
    meal_type: payload.meal_type,
    foods: payload.foods || [],
    sodium_mg: payload.sodium_mg || 0,
    calories: payload.calories || 0,
    fiber_g: payload.fiber_g || 0,
    sugar_g: payload.sugar_g,
    logged_for: loggedFor,
    feedback,
  });

  return {
    meal: saved,
    feedback,
  };
};

const listMeals = async (patient_id, user, filters = {}) => {
  await ensurePatientLink(user, patient_id);
  return nutritionRepository.getMealsByPatient(patient_id, filters);
};

module.exports = {
  saveNutritionProfile,
  getNutritionProfile,
  generateDietPlan,
  logMeal,
  listMeals,
};
