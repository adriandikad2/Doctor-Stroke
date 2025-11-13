const prescriptionRepository = require('../repositories/prescription.repository');
const patientRepository = require('../repositories/patient.repository');
const adherenceRepository = require('../repositories/adherence.repository');
const interactionRepository = require('../repositories/medicationInteraction.repository');

const ALLOWED_ADHERENCE_STATUS = ['taken', 'missed', 'delayed'];

const ensureDoctorOrAdmin = (role) => {
  if (!['doctor', 'admin'].includes(role)) {
    throw new Error('Only doctors or admins can perform this action');
  }
};

const ensurePatientLink = async (user, patient_id) => {
  if (user.role === 'admin') {
    return true;
  }

  const isLinked = await patientRepository.isUserLinkedToPatient(user.userId, patient_id);
  if (!isLinked) {
    throw new Error('Access denied: Not linked to patient');
  }

  return true;
};

const normalizeDosingTimes = (frequency, dosing_times) => {
  if (dosing_times?.length) {
    return dosing_times;
  }

  const times = [];
  const intervalHours = Math.floor(24 / Math.max(frequency, 1));

  for (let i = 0; i < frequency; i += 1) {
    const hour = (i * intervalHours) % 24;
    const paddedHour = hour.toString().padStart(2, '0');
    times.push(`${paddedHour}:00`);
  }

  return times;
};

const createPrescription = async (payload, user) => {
  ensureDoctorOrAdmin(user.role);

  if (!payload.patient_id || !payload.medication_name || !payload.dosage || !payload.start_date) {
    throw new Error('Required fields are missing');
  }

  await ensurePatientLink(user, payload.patient_id);

  const frequency = payload.frequency_per_day || (payload.dosing_times?.length ?? 1);

  const newPrescription = await prescriptionRepository.createPrescription({
    prescription_id: null,
    patient_id: payload.patient_id,
    doctor_id: user.userId,
    medication_name: payload.medication_name,
    dosage: payload.dosage,
    instructions: payload.instructions,
    frequency_per_day: frequency,
    dosing_times: normalizeDosingTimes(frequency, payload.dosing_times),
    start_date: payload.start_date,
    end_date: payload.end_date,
    reminder_window_minutes: payload.reminder_window_minutes || 15,
    is_critical: payload.is_critical ?? false,
  });

  return newPrescription;
};

const updatePrescription = async (prescription_id, updates, user) => {
  ensureDoctorOrAdmin(user.role);

  const existing = await prescriptionRepository.findPrescriptionById(prescription_id);
  if (!existing) {
    throw new Error('Prescription not found');
  }

  if (user.role === 'doctor' && existing.doctor_id !== user.userId) {
    throw new Error('Access denied: Not the prescribing doctor');
  }

  await ensurePatientLink(user, existing.patient_id);

  const payload = { ...updates };

  if (updates.frequency_per_day || updates.dosing_times) {
    const frequency = updates.frequency_per_day || existing.frequency_per_day;
    payload.frequency_per_day = frequency;
    payload.dosing_times = normalizeDosingTimes(frequency, updates.dosing_times);
  }

  const updated = await prescriptionRepository.updatePrescription(prescription_id, payload);
  return updated;
};

const getPrescriptionsForPatient = async (patient_id, user, includeInactive = false) => {
  await ensurePatientLink(user, patient_id);
  return prescriptionRepository.findPrescriptionsByPatient(patient_id, { includeInactive });
};

const togglePrescriptionStatus = async (prescription_id, is_active, user) => {
  ensureDoctorOrAdmin(user.role);

  const existing = await prescriptionRepository.findPrescriptionById(prescription_id);
  if (!existing) {
    throw new Error('Prescription not found');
  }

  await ensurePatientLink(user, existing.patient_id);

  return prescriptionRepository.setPrescriptionStatus(prescription_id, Boolean(is_active));
};

const logAdherence = async (prescription_id, payload, user) => {
  const prescription = await prescriptionRepository.findPrescriptionById(prescription_id);
  if (!prescription) {
    throw new Error('Prescription not found');
  }

  await ensurePatientLink(user, prescription.patient_id);

  if (!ALLOWED_ADHERENCE_STATUS.includes(payload.status)) {
    throw new Error('Adherence status is invalid');
  }

  const adherence = await adherenceRepository.logAdherenceEvent({
    adherence_id: null,
    prescription_id,
    patient_id: prescription.patient_id,
    logged_by: user.userId,
    status: payload.status,
    scheduled_time: payload.scheduled_time,
    taken_time: payload.taken_time,
    notes: payload.notes,
  });

  return adherence;
};

const getAdherenceSummary = async (prescription_id, user, days = 7) => {
  const prescription = await prescriptionRepository.findPrescriptionById(prescription_id);
  if (!prescription) {
    throw new Error('Prescription not found');
  }

  await ensurePatientLink(user, prescription.patient_id);

  const stats = await adherenceRepository.getAdherenceStats(prescription_id, days);
  const total = Number(stats.total_events || 0);
  const adherenceRate = total
    ? Math.round((Number(stats.taken_count || 0) / total) * 100)
    : 0;

  return {
    window_days: days,
    totals: {
      taken: Number(stats.taken_count || 0),
      missed: Number(stats.missed_count || 0),
      delayed: Number(stats.delayed_count || 0),
      total,
    },
    adherence_rate: adherenceRate,
  };
};

const checkInteractions = async (patient_id, medication_name, user, excludePrescriptionId = null) => {
  if (!medication_name) {
    throw new Error('Medication name is required');
  }

  await ensurePatientLink(user, patient_id);

  const concurrent = await prescriptionRepository.listActiveMedicationNames(
    patient_id,
    excludePrescriptionId,
  );

  return interactionRepository.findConflicts(medication_name, concurrent);
};

const buildReminderWindows = (prescription, daysAhead = 3) => {
  const now = new Date();
  const startDate = new Date(prescription.start_date);
  const anchorDate = startDate > now ? startDate : now;
  const endDate = prescription.end_date ? new Date(prescription.end_date) : null;

  const reminders = [];

  const dosingTimes = Array.isArray(prescription.dosing_times) && prescription.dosing_times.length
    ? prescription.dosing_times
    : normalizeDosingTimes(prescription.frequency_per_day, prescription.dosing_times);

  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const day = new Date(Date.UTC(
      anchorDate.getUTCFullYear(),
      anchorDate.getUTCMonth(),
      anchorDate.getUTCDate(),
    ));
    day.setUTCDate(day.getUTCDate() + offset);

    if (endDate && day > endDate) {
      break;
    }

    dosingTimes.forEach((timeStr) => {
      const [hours, minutes] = timeStr.split(':').map((value) => parseInt(value, 10));
      const reminderDate = new Date(day);
      reminderDate.setUTCHours(hours);
      reminderDate.setUTCMinutes(minutes || 0);
      reminderDate.setUTCSeconds(0);
      reminderDate.setUTCMilliseconds(0);

      if (reminderDate < now) {
        return;
      }

      reminders.push({
        medication_name: prescription.medication_name,
        dosage: prescription.dosage,
        scheduled_time: reminderDate.toISOString(),
        reminder_window_minutes: prescription.reminder_window_minutes,
        is_critical: prescription.is_critical,
      });
    });
  }

  return reminders.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
};

const getUpcomingReminders = async (prescription_id, user, daysAhead = 3) => {
  const prescription = await prescriptionRepository.findPrescriptionById(prescription_id);
  if (!prescription) {
    throw new Error('Prescription not found');
  }

  await ensurePatientLink(user, prescription.patient_id);

  return buildReminderWindows(prescription, daysAhead);
};

module.exports = {
  createPrescription,
  updatePrescription,
  getPrescriptionsForPatient,
  togglePrescriptionStatus,
  logAdherence,
  getAdherenceSummary,
  checkInteractions,
  getUpcomingReminders,
};
