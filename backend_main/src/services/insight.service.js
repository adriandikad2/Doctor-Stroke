import * as patientService from './patient.service.js';
import * as logService from './log.service.js';
import * as nutritionService from './nutrition.service.js';
import * as prescriptionService from './prescription.service.js';
import * as appointmentService from './appointment.service.js';
import { requestGeminiSummary } from '../clients/gemini.client.js';

const MAX_ITEMS = 5;

/**
 * Mengambil ringkasan AI untuk satu pasien.
 * @param {string} patientId
 * @param {object} user - req.user dari middleware auth
 */
export const getPatientInsightSummary = async (patientId, user) => {
  if (!patientId) {
    throw new Error('patientId diperlukan');
  }

  // Pastikan user terhubung & ambil profil pasien
  const patientProfile = await patientService.getPatientDetails(patientId, user);

  const [
    nutritionProfile,
    mealLogs,
    adherenceLogs,
    prescriptions,
    appointments,
    snapshots,
  ] = await Promise.all([
    nutritionService.getProfile(patientId).catch(() => null),
    logService.getMealLogs(patientId).catch(() => []),
    logService.getAdherenceLogs(patientId).catch(() => []),
    prescriptionService.getPrescriptions(patientId).catch(() => []),
    appointmentService.getAppointmentsByPatient?.(patientId).catch?.(() => []) || [],
    logService.getSnapshotLogs(patientId).catch(() => []),
  ]);

  const context = {
    patient: {
      name: patientProfile.name,
      gender: patientProfile.gender,
      date_of_birth: patientProfile.date_of_birth,
      unique_code: patientProfile.unique_code,
    },
    nutritionProfile,
    latestMeals: mealLogs.slice(-MAX_ITEMS),
    medicationAdherence: adherenceLogs.slice(-MAX_ITEMS),
    prescriptions: prescriptions.slice(0, MAX_ITEMS),
    upcomingAppointments: appointments
      .filter((a) => new Date(a.start_time) >= new Date())
      .slice(0, MAX_ITEMS),
    progressSnapshots: snapshots.slice(-MAX_ITEMS),
  };

  const prompt = `
Anda adalah asisten rehabilitasi stroke. Buat ringkasan singkat (≤100 kata, Bahasa Indonesia formal) untuk keluarga tentang:
1. Pola diet & nutrisi penting
2. Kepatuhan obat & catatan terapi
3. Jadwal janji temu / aktivitas yang perlu diperhatikan
4. Rekomendasi tindakan lanjut maksimal 3 bullet

Gunakan nada suportif. Jika ada data kosong, sebutkan secara singkat tanpa spekulasi.
`;

  const summaryText = await requestGeminiSummary(prompt, context);

  return {
    patient_id: patientId,
    generated_at: new Date().toISOString(),
    summary: summaryText,
    context_excerpt: {
      nutritionProfile,
      latestMeals: context.latestMeals,
      medicationAdherence: context.medicationAdherence,
      upcomingAppointments: context.upcomingAppointments,
    },
  };
};