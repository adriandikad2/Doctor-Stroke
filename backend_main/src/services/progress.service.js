const progressRepository = require('../repositories/progress.repository');
const patientRepository = require('../repositories/patient.repository');
const adherenceRepository = require('../repositories/adherence.repository');

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

const recordSnapshot = async (payload, user) => {
  if (!payload.patient_id) {
    throw new Error('Patient ID is required');
  }

  await ensurePatientLink(user, payload.patient_id);

  const snapshot = await progressRepository.createSnapshot({
    entry_id: null,
    patient_id: payload.patient_id,
    recorded_by: user.userId,
    recorded_at: payload.recorded_at || new Date().toISOString(),
    mood: payload.mood,
    symptom_score: payload.symptom_score,
    mobility_score: payload.mobility_score,
    exercise_completed: payload.exercise_completed,
    blood_pressure_systolic: payload.blood_pressure?.systolic,
    blood_pressure_diastolic: payload.blood_pressure?.diastolic,
    medication_adherence_score: payload.medication_adherence_score,
    notes: payload.notes,
    tags: payload.tags,
  });

  return snapshot;
};

const getSnapshotsForPatient = async (patient_id, user, filters = {}) => {
  await ensurePatientLink(user, patient_id);
  return progressRepository.getSnapshotsByPatient(patient_id, filters);
};

const buildReport = async (patient_id, user, filters = {}) => {
  const snapshots = await getSnapshotsForPatient(patient_id, user, filters);

  if (!snapshots.length) {
    return {
      total_entries: 0,
      exercise_adherence: 0,
      averages: {},
      trends: {},
    };
  }

  const totals = snapshots.reduce(
    (acc, snap) => {
      acc.symptomSum += snap.symptom_score ?? 0;
      acc.mobilitySum += snap.mobility_score ?? 0;
      if (snap.exercise_completed === true) {
        acc.exerciseCompleted += 1;
      }
      if (snap.medication_adherence_score != null) {
        acc.adherenceSum += snap.medication_adherence_score;
        acc.adherenceCount += 1;
      }
      return acc;
    },
    {
      symptomSum: 0,
      mobilitySum: 0,
      exerciseCompleted: 0,
      adherenceSum: 0,
      adherenceCount: 0,
    },
  );

  const exercise_adherence = Math.round((totals.exerciseCompleted / snapshots.length) * 100);

  const averages = {
    symptom_score: Number((totals.symptomSum / snapshots.length).toFixed(2)),
    mobility_score: Number((totals.mobilitySum / snapshots.length).toFixed(2)),
    medication_adherence_score: totals.adherenceCount
      ? Number((totals.adherenceSum / totals.adherenceCount).toFixed(2))
      : null,
  };

  const trends = {
    symptom: snapshots.map((snap) => ({
      date: snap.recorded_at,
      value: snap.symptom_score,
    })),
    mobility: snapshots.map((snap) => ({
      date: snap.recorded_at,
      value: snap.mobility_score,
    })),
    blood_pressure: snapshots
      .filter((snap) => snap.blood_pressure_systolic && snap.blood_pressure_diastolic)
      .map((snap) => ({
        date: snap.recorded_at,
        systolic: snap.blood_pressure_systolic,
        diastolic: snap.blood_pressure_diastolic,
      })),
  };

  return {
    total_entries: snapshots.length,
    exercise_adherence,
    averages,
    trends,
  };
};

const generatePredictiveAlerts = async (patient_id, user) => {
  await ensurePatientLink(user, patient_id);

  const recentSnapshots = await progressRepository.getSnapshotsWithinDays(patient_id, 7);
  const missedMedication = await adherenceRepository.getRecentMissedByPatient(patient_id, 7);

  const alerts = [];

  if (missedMedication >= 3) {
    alerts.push({
      severity: 'high',
      title: 'Medication Adherence Declined',
      message: `${missedMedication} doses of critical medications were missed in the last 7 days.`,
      recommendation: 'Contact healthcare provider to evaluate adherence factors.',
    });
  }

  if (recentSnapshots.length >= 3) {
    const lastThree = recentSnapshots.slice(0, 3);
    const mobilityDowntrend = lastThree.every(
      (snap, idx, arr) => idx === 0 || (snap.mobility_score ?? 0) <= (arr[idx - 1].mobility_score ?? 0),
    );

    if (mobilityDowntrend) {
      alerts.push({
        severity: 'medium',
        title: 'Declining Mobility',
        message: 'Patient mobility trend has declined over the last 3 days.',
        recommendation: 'Review physical therapy program or home exercise routine.',
      });
    }

    const highSymptoms = lastThree.filter((snap) => (snap.symptom_score ?? 0) >= 7);
    if (highSymptoms.length >= 2) {
      alerts.push({
        severity: 'medium',
        title: 'Symptom Severity Increased',
        message: 'High symptom scores recorded on multiple recent days.',
        recommendation: 'Consider expedited medical consultation.',
      });
    }

    const missedExercises = lastThree.filter((snap) => snap.exercise_completed === false);
    if (missedExercises.length === lastThree.length) {
      alerts.push({
        severity: 'low',
        title: 'Rehabilitation Exercises Missed',
        message: 'No rehabilitation exercises completed in the last 3 days.',
        recommendation: 'Set additional reminders or schedule therapist visit.',
      });
    }
  }

  return alerts;
};

module.exports = {
  recordSnapshot,
  getSnapshotsForPatient,
  buildReport,
  generatePredictiveAlerts,
};
