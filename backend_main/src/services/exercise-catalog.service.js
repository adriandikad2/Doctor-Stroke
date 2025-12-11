import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new exercise catalog
 */
export const createCatalog = async (catalogData) => {
  return await prisma.exercise_catalogs.create({
    data: catalogData,
  });
};

/**
 * Get all exercise catalogs
 */
export const getAllCatalogs = async () => {
  return await prisma.exercise_catalogs.findMany({
    orderBy: {
      created_at: 'desc',
    },
  });
};

/**
 * Get exercise catalogs by specialization
 */
export const getBySpecialization = async (specialization) => {
  return await prisma.exercise_catalogs.findMany({
    where: { specialization },
    orderBy: {
      created_at: 'desc',
    },
  });
};

/**
 * Get a specific exercise catalog by ID
 */
export const getCatalogById = async (catalogId) => {
  const catalog = await prisma.exercise_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });

  if (!catalog) {
    throw new Error('Katalog latihan tidak ditemukan');
  }

  return catalog;
};

/**
 * Update an exercise catalog
 */
export const updateCatalog = async (catalogId, catalogData) => {
  const catalog = await prisma.exercise_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });

  if (!catalog) {
    throw new Error('Katalog latihan tidak ditemukan');
  }

  return await prisma.exercise_catalogs.update({
    where: { catalog_id: catalogId },
    data: catalogData,
  });
};

/**
 * Delete an exercise catalog
 */
export const deleteCatalog = async (catalogId) => {
  const catalog = await prisma.exercise_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });

  if (!catalog) {
    throw new Error('Katalog latihan tidak ditemukan');
  }

  return await prisma.exercise_catalogs.delete({
    where: { catalog_id: catalogId },
  });
};

/**
 * Assign an exercise catalog to a patient
 */
export const assignToPatient = async (catalogId, patientId, therapistUserId) => {
  // Verify catalog exists
  const catalog = await prisma.exercise_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });

  if (!catalog) {
    throw new Error('Katalog latihan tidak ditemukan');
  }

  // Verify patient exists
  const patient = await prisma.patient_profiles.findUnique({
    where: { patient_id: patientId },
  });

  if (!patient) {
    throw new Error('Pasien tidak ditemukan');
  }

  // Check if already assigned
  const existing = await prisma.patient_exercise_catalogs.findUnique({
    where: {
      patient_id_catalog_id: {
        patient_id: patientId,
        catalog_id: catalogId,
      },
    },
  });

  if (existing) {
    throw new Error('Latihan sudah ditambahkan untuk pasien ini');
  }

  return await prisma.patient_exercise_catalogs.create({
    data: {
      patient_id: patientId,
      catalog_id: catalogId,
      therapist_user_id: therapistUserId,
    },
    include: {
      exercise: true,
      therapist_user: {
        select: {
          user_id: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get all exercises assigned to a patient
 */
export const getPatientExercises = async (patientId) => {
  return await prisma.patient_exercise_catalogs.findMany({
    where: { patient_id: patientId },
    include: {
      exercise: true,
      therapist_user: {
        select: {
          user_id: true,
          email: true,
        },
      },
      adherence_logs: {
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
      },
    },
  });
};

/**
 * Remove an exercise from a patient
 */
export const removePatientExercise = async (patientExId) => {
  const patientEx = await prisma.patient_exercise_catalogs.findUnique({
    where: { patient_ex_id: patientExId },
  });

  if (!patientEx) {
    throw new Error('Penugasan latihan tidak ditemukan');
  }

  return await prisma.patient_exercise_catalogs.delete({
    where: { patient_ex_id: patientExId },
  });
};

/**
 * Log exercise adherence (taken/missed)
 */
export const logAdherence = async ({ patient_ex_id, patient_id, status, notes, logged_by_user_id, date }) => {
  if (!patient_ex_id || !patient_id || !logged_by_user_id) {
    throw new Error('patient_ex_id, patient_id, dan logged_by_user_id diperlukan');
  }

  return prisma.exercise_adherence_logs.create({
    data: {
      patient_ex_id,
      patient_id,
      logged_by_user_id,
      status: status || 'taken',
      scheduled_date: date ? new Date(date) : null,
      actual_date: new Date(),
      notes: notes || null,
    },
  });
};

/**
 * Get exercise adherence statistics for a patient
 */
export const getAdherenceStats = async (patientId, startDate, endDate) => {
  const logs = await prisma.exercise_adherence_logs.findMany({
    where: {
      patient_id: patientId,
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      patient_exercise: {
        include: {
          exercise: true,
        },
      },
    },
  });

  // Group by exercise and calculate stats
  const stats = {};
  logs.forEach((log) => {
    const exName = log.patient_exercise.exercise.exercise_name;
    if (!stats[exName]) {
      stats[exName] = {
        total: 0,
        taken: 0,
        missed: 0,
      };
    }
    stats[exName].total += 1;
    stats[exName][log.status] += 1;
  });

  return stats;
};
