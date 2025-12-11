import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new medication catalog
 */
export const createCatalog = async (catalogData) => {
  return await prisma.medication_catalogs.create({
    data: catalogData,
  });
};

/**
 * Get all medication catalogs
 */
export const getAllCatalogs = async () => {
  return await prisma.medication_catalogs.findMany({
    orderBy: {
      created_at: 'desc',
    },
  });
};

/**
 * Get a specific medication catalog by ID
 */
export const getCatalogById = async (catalogId) => {
  const catalog = await prisma.medication_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });

  if (!catalog) {
    throw new Error('Katalog obat tidak ditemukan');
  }

  return catalog;
};

/**
 * Update a medication catalog
 */
export const updateCatalog = async (catalogId, catalogData) => {
  const catalog = await prisma.medication_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });

  if (!catalog) {
    throw new Error('Katalog obat tidak ditemukan');
  }

  return await prisma.medication_catalogs.update({
    where: { catalog_id: catalogId },
    data: catalogData,
  });
};

/**
 * Delete a medication catalog
 */
export const deleteCatalog = async (catalogId) => {
  const catalog = await prisma.medication_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });

  if (!catalog) {
    throw new Error('Katalog obat tidak ditemukan');
  }

  return await prisma.medication_catalogs.delete({
    where: { catalog_id: catalogId },
  });
};

/**
 * Assign a medication catalog to a patient
 */
export const assignToPatient = async (catalogId, patientId, doctorUserId) => {
  // Verify catalog exists
  const catalog = await prisma.medication_catalogs.findUnique({
    where: { catalog_id: catalogId },
  });

  if (!catalog) {
    throw new Error('Katalog obat tidak ditemukan');
  }

  // Verify patient exists
  const patient = await prisma.patient_profiles.findUnique({
    where: { patient_id: patientId },
  });

  if (!patient) {
    throw new Error('Pasien tidak ditemukan');
  }

  // Check if already assigned
  const existing = await prisma.patient_medication_catalogs.findUnique({
    where: {
      patient_id_catalog_id: {
        patient_id: patientId,
        catalog_id: catalogId,
      },
    },
  });

  if (existing) {
    throw new Error('Obat sudah ditambahkan untuk pasien ini');
  }

  return await prisma.patient_medication_catalogs.create({
    data: {
      patient_id: patientId,
      catalog_id: catalogId,
      doctor_user_id: doctorUserId,
    },
    include: {
      medication: true,
      doctor_user: {
        select: {
          user_id: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get all medications assigned to a patient
 */
export const getPatientMedications = async (patientId) => {
  return await prisma.patient_medication_catalogs.findMany({
    where: { patient_id: patientId },
    include: {
      medication: true,
      doctor_user: {
        select: {
          user_id: true,
          email: true,
        },
      },
      adherence_logs: {
        orderBy: { created_at: 'desc' },
        take: 20,
      },
    },
  });
};

/**
 * Remove a medication from a patient
 */
export const removePatientMedication = async (patientMedId) => {
  const patientMed = await prisma.patient_medication_catalogs.findUnique({
    where: { patient_med_id: patientMedId },
  });

  if (!patientMed) {
    throw new Error('Penugasan obat tidak ditemukan');
  }

  return await prisma.patient_medication_catalogs.delete({
    where: { patient_med_id: patientMedId },
  });
};

/**
 * Update patient-medication link (doctor or schedule metadata)
 */
export const updatePatientMedication = async (patientMedId, payload) => {
  const patientMed = await prisma.patient_medication_catalogs.findUnique({
    where: { patient_med_id: patientMedId },
  });
  if (!patientMed) {
    throw new Error('Penugasan obat tidak ditemukan');
  }

  const { doctor_user_id, prescribed_date } = payload;

  return prisma.patient_medication_catalogs.update({
    where: { patient_med_id: patientMedId },
    data: {
      doctor_user_id: doctor_user_id || patientMed.doctor_user_id,
      prescribed_date: prescribed_date ? new Date(prescribed_date) : patientMed.prescribed_date,
    },
  });
};

/**
 * Log medication adherence (taken/missed/delayed)
 */
export const logAdherence = async ({ patient_med_id, patient_id, logged_by_user_id, status, scheduled_time, taken_time, notes }) => {
  if (!patient_med_id || !patient_id || !logged_by_user_id) {
    throw new Error('patient_med_id, patient_id, dan logged_by_user_id diperlukan');
  }

  return prisma.medication_adherence_logs_v2.create({
    data: {
      patient_med_id,
      patient_id,
      logged_by_user_id,
      status: status || 'taken',
      scheduled_time: scheduled_time ? new Date(scheduled_time) : null,
      taken_time: taken_time ? new Date(taken_time) : new Date(),
      notes: notes || null,
    },
  });
};

/**
 * Get medication adherence statistics for a patient
 */
export const getAdherenceStats = async (patientId, startDate, endDate) => {
  const logs = await prisma.medication_adherence_logs_v2.findMany({
    where: {
      patient_id: patientId,
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      patient_medication: {
        include: {
          medication: true,
        },
      },
    },
  });

  // Group by medication and calculate stats
  const stats = {};
  logs.forEach((log) => {
    const medName = log.patient_medication.medication.medication_name;
    if (!stats[medName]) {
      stats[medName] = {
        total: 0,
        taken: 0,
        missed: 0,
        delayed: 0,
      };
    }
    stats[medName].total += 1;
    stats[medName][log.status] += 1;
  });

  return stats;
};
