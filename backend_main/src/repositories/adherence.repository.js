import prisma from '../config/db.js';

export const logAdherenceEvent = async (data) => {
  return prisma.medication_adherence_logs.create({
    data: {
      adherence_id: data.adherence_id || undefined,
      prescription_id: data.prescription_id,
      patient_id: data.patient_id,
      logged_by_user_id: data.logged_by || data.logged_by_user_id,
      status: data.status,
      scheduled_time: data.scheduled_time ? new Date(data.scheduled_time) : null,
      taken_time: data.taken_time ? new Date(data.taken_time) : null,
      notes: data.notes || null,
    },
  });
};

export const getLogsForPrescription = async (prescription_id, { limit = 50 } = {}) => {
  return prisma.medication_adherence_logs.findMany({
    where: { prescription_id },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
};

export const getAdherenceStats = async (prescription_id, days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const logs = await prisma.medication_adherence_logs.findMany({
    where: { prescription_id, created_at: { gte: since } },
  });
  const stats = { taken_count: 0, missed_count: 0, delayed_count: 0, total_events: logs.length };
  logs.forEach((l) => {
    if (l.status === 'taken') stats.taken_count += 1;
    if (l.status === 'missed') stats.missed_count += 1;
    if (l.status === 'delayed') stats.delayed_count += 1;
  });
  return stats;
};

export const getRecentMissedByPatient = async (patient_id, days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const count = await prisma.medication_adherence_logs.count({
    where: { patient_id, status: 'missed', created_at: { gte: since } },
  });
  return count;
};

export default {
  logAdherenceEvent,
  getLogsForPrescription,
  getAdherenceStats,
  getRecentMissedByPatient,
};
