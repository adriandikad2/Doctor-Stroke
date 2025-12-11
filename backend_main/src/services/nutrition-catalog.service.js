import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nutrition catalog CRUD
export const createCatalog = async (catalogData) => {
  return prisma.nutrition_food_catalogs.create({ data: catalogData });
};

export const getAllCatalogs = async () => {
  return prisma.nutrition_food_catalogs.findMany({
    orderBy: { created_at: 'desc' },
  });
};

export const getByCategory = async (category) => {
  return prisma.nutrition_food_catalogs.findMany({
    where: { food_category: category },
    orderBy: { created_at: 'desc' },
  });
};

export const getCatalogById = async (catalogId) => {
  const catalog = await prisma.nutrition_food_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });
  if (!catalog) {
    throw new Error('Katalog makanan tidak ditemukan');
  }
  return catalog;
};

export const updateCatalog = async (catalogId, catalogData) => {
  await getCatalogById(catalogId);
  return prisma.nutrition_food_catalogs.update({
    where: { catalog_id: catalogId },
    data: catalogData,
  });
};

export const deleteCatalog = async (catalogId) => {
  await getCatalogById(catalogId);
  return prisma.nutrition_food_catalogs.delete({
    where: { catalog_id: catalogId },
  });
};

// Patient assignment
export const assignToPatient = async (catalogId, patientId, doctorUserId) => {
  const catalog = await prisma.nutrition_food_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });
  if (!catalog) throw new Error('Katalog makanan tidak ditemukan');

  const patient = await prisma.patient_profiles.findUnique({
    where: { patient_id: patientId },
  });
  if (!patient) throw new Error('Pasien tidak ditemukan');

  const existing = await prisma.patient_nutrition_catalogs.findUnique({
    where: { patient_id_catalog_id: { patient_id: patientId, catalog_id: catalogId } },
  });
  if (existing) throw new Error('Menu sudah ditambahkan untuk pasien ini');

  return prisma.patient_nutrition_catalogs.create({
    data: {
      patient_id: patientId,
      catalog_id: catalogId,
      doctor_user_id: doctorUserId,
    },
    include: {
      food: true,
      doctor_user: { select: { user_id: true, email: true } },
    },
  });
};

export const getPatientFoods = async (patientId) => {
  return prisma.patient_nutrition_catalogs.findMany({
    where: { patient_id: patientId },
    include: {
      food: true,
      doctor_user: { select: { user_id: true, email: true } },
      adherence_logs: { orderBy: { created_at: 'desc' }, take: 20 },
    },
  });
};

export const removePatientFood = async (patientFoodId) => {
  const patientFood = await prisma.patient_nutrition_catalogs.findUnique({
    where: { patient_food_id: patientFoodId },
  });
  if (!patientFood) throw new Error('Penugasan makanan tidak ditemukan');

  return prisma.patient_nutrition_catalogs.delete({
    where: { patient_food_id: patientFoodId },
  });
};

// Adherence
export const logAdherence = async ({ patient_food_id, patient_id, logged_by_user_id, status, notes, date }) => {
  if (!patient_food_id || !patient_id || !logged_by_user_id) {
    throw new Error('patient_food_id, patient_id, dan logged_by_user_id diperlukan');
  }

  return prisma.nutrition_adherence_logs.create({
    data: {
      patient_food_id,
      patient_id,
      logged_by_user_id,
      status: status || 'taken',
      scheduled_date: date ? new Date(date) : null,
      actual_date: new Date(),
      notes: notes || null,
    },
  });
};

export const getAdherenceStats = async (patientId, startDate, endDate) => {
  const logs = await prisma.nutrition_adherence_logs.findMany({
    where: {
      patient_id: patientId,
      created_at: { gte: startDate, lte: endDate },
    },
    include: {
      patient_food: { include: { food: true } },
    },
  });

  const stats = {};
  logs.forEach((log) => {
    const foodName = log.patient_food.food.food_name;
    if (!stats[foodName]) {
      stats[foodName] = { total: 0, taken: 0, missed: 0 };
    }
    stats[foodName].total += 1;
    stats[foodName][log.status] += 1;
  });
  return stats;
};
