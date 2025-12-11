import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { strokeMedications, nutritionCatalog } from '../src/config/seedCatalogs.js';

dotenv.config();

const prisma = new PrismaClient();

const syncMedications = async () => {
  const names = strokeMedications.map((m) => m.medication_name);

  // Remove catalogs that are no longer in seed (e.g., Warfarin, Enoxaparin)
  const removed = await prisma.medication_catalogs.deleteMany({
    where: { medication_name: { notIn: names } },
  });
  if (removed.count > 0) {
    console.log(`[sync] Removed ${removed.count} medication_catalogs not in seed`);
  }

  // Update/create from seed
  for (const med of strokeMedications) {
    const existing = await prisma.medication_catalogs.findFirst({
      where: { medication_name: med.medication_name },
    });
    if (existing) {
      await prisma.medication_catalogs.update({
        where: { catalog_id: existing.catalog_id },
        data: {
          description: med.description,
          dosage_standard: med.dosage_standard,
          side_effects: med.side_effects,
          contraindications: med.contraindications,
          image_url: med.image_url,
          manufacturer: med.manufacturer,
          registration_no: med.registration_no,
          product_category: med.product_category,
        },
      });
    } else {
      await prisma.medication_catalogs.create({ data: med });
    }
  }
};

const syncNutrition = async () => {
  const names = nutritionCatalog.map((f) => f.food_name);

  // Remove foods not in seed
  const removed = await prisma.nutrition_food_catalogs.deleteMany({
    where: { food_name: { notIn: names } },
  });
  if (removed.count > 0) {
    console.log(`[sync] Removed ${removed.count} nutrition_food_catalogs not in seed`);
  }

  for (const food of nutritionCatalog) {
    const existing = await prisma.nutrition_food_catalogs.findFirst({
      where: { food_name: food.food_name },
    });
    if (existing) {
      await prisma.nutrition_food_catalogs.updateMany({
        where: { food_name: food.food_name },
        data: {
          description: food.description,
          food_category: food.food_category,
          meal_type: food.meal_type,
          image_url: food.image_url,
          calories: food.calories,
          sodium_mg: food.sodium_mg,
          fiber_g: food.fiber_g,
        },
      });
    } else {
      await prisma.nutrition_food_catalogs.create({ data: food });
    }
  }
};

const main = async () => {
  await syncMedications();
  await syncNutrition();
  console.log('[sync] Catalogs synchronized with seed data.');
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
