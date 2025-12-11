import prisma from '../config/db.js';

export const createSnapshot = async (data) => {
  return prisma.patient_progress_snapshots.create({
    data: {
      entry_id: data.entry_id || undefined,
      patient_id: data.patient_id,
      recorded_by_user_id: data.recorded_by,
      recorded_at: data.recorded_at ? new Date(data.recorded_at) : new Date(),
      mood: data.mood || null,
      symptom_score: data.symptom_score ?? null,
      mobility_score: data.mobility_score ?? null,
      exercise_completed: data.exercise_completed ?? null,
      blood_pressure_systolic: data.blood_pressure_systolic ?? null,
      blood_pressure_diastolic: data.blood_pressure_diastolic ?? null,
      medication_adherence_score: data.medication_adherence_score ?? null,
      notes: data.notes || null,
      tags: data.tags?.length ? data.tags : undefined,
    },
  });
};

export const getSnapshotsByPatient = async (patient_id, filters = {}) => {
  const where = { patient_id };
  if (filters.startDate || filters.endDate) {
    where.recorded_at = {};
    if (filters.startDate) where.recorded_at.gte = new Date(filters.startDate);
    if (filters.endDate) where.recorded_at.lte = new Date(filters.endDate);
  }

  return prisma.patient_progress_snapshots.findMany({
    where,
    orderBy: { recorded_at: 'desc' },
  });
};

export const getSnapshotsWithinDays = async (patient_id, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return prisma.patient_progress_snapshots.findMany({
    where: {
      patient_id,
      recorded_at: { gte: startDate },
    },
    orderBy: { recorded_at: 'desc' },
  });
};

export default {
  createSnapshot,
  getSnapshotsByPatient,
  getSnapshotsWithinDays,
};
