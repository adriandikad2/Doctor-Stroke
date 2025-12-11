import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import progressService from '../services/progress.service.js';

const recordSnapshot = async (req, res) => {
  try {
    const snapshot = await progressService.recordSnapshot(req.body, req.user);
    res.status(201).json({
      message: 'Progress harian tersimpan',
      snapshot,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSnapshots = async (req, res) => {
  try {
    const snapshots = await progressService.getSnapshotsForPatient(
      req.params.patientId,
      req.user,
      {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      },
    );

    res.status(200).json({
      message: 'Snapshot progress berhasil diambil',
      snapshots,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProgressReport = async (req, res) => {
  try {
    const report = await progressService.buildReport(
      req.params.patientId,
      req.user,
      {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      },
    );

    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPredictiveAlerts = async (req, res) => {
  try {
    const alerts = await progressService.generatePredictiveAlerts(
      req.params.patientId,
      req.user,
    );
    res.status(200).json({
      message: 'Analisis risiko berhasil dijalankan',
      alerts,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * POST /api/progress/vitals
 * Log daily vital signs (blood pressure, mood, notes)
 */
const logVitals = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { patientId, bloodPressureSystolic, bloodPressureDiastolic, mood, notes } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'patientId is required'
      });
    }

    // Create vitals entry (using patient_progress_snapshots)
    const snapshot = await prisma.patient_progress_snapshots.create({
      data: {
        patient_id: patientId,
        recorded_by_user_id: userId,
        recorded_at: new Date(),
        blood_pressure_systolic: bloodPressureSystolic || null,
        blood_pressure_diastolic: bloodPressureDiastolic || null,
        mood: mood || null,
        notes: notes || null
      },
      include: {
        patient: {
          select: { name: true, patient_id: true }
        },
        recorded_by_user: {
          select: { email: true, family_profile: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Vital signs logged successfully',
      data: snapshot
    });
  } catch (error) {
    console.error('Error logging vitals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log vital signs',
      error: error.message
    });
  }
};

/**
 * GET /api/progress/vitals/:patientId
 * Get vital signs trends untuk graph visualization
 */
const getVitalsTrends = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const snapshots = await prisma.patient_progress_snapshots.findMany({
      where: {
        patient_id: patientId,
        recorded_at: { gte: startDate }
      },
      orderBy: { recorded_at: 'asc' },
      select: {
        recorded_at: true,
        blood_pressure_systolic: true,
        blood_pressure_diastolic: true,
        mood: true,
        notes: true
      }
    });

    // Format data untuk graph
    const bloodPressureTrend = snapshots
      .filter(s => s.blood_pressure_systolic && s.blood_pressure_diastolic)
      .map(s => ({
        date: s.recorded_at.toISOString().split('T')[0],
        time: s.recorded_at.toISOString(),
        systolic: s.blood_pressure_systolic,
        diastolic: s.blood_pressure_diastolic
      }));

    const moodTrend = snapshots
      .filter(s => s.mood)
      .map(s => ({
        date: s.recorded_at.toISOString().split('T')[0],
        mood: s.mood
      }));

    // Calculate statistics
    const systolicReadings = snapshots
      .filter(s => s.blood_pressure_systolic)
      .map(s => s.blood_pressure_systolic);
    
    const diastolicReadings = snapshots
      .filter(s => s.blood_pressure_diastolic)
      .map(s => s.blood_pressure_diastolic);

    const avgSystolic = systolicReadings.length > 0 
      ? (systolicReadings.reduce((a, b) => a + b, 0) / systolicReadings.length).toFixed(1)
      : null;
    
    const avgDiastolic = diastolicReadings.length > 0 
      ? (diastolicReadings.reduce((a, b) => a + b, 0) / diastolicReadings.length).toFixed(1)
      : null;

    res.status(200).json({
      success: true,
      data: {
        patientId,
        period: `${days} days`,
        bloodPressureTrend,
        moodTrend,
        statistics: {
          averageSystolic: parseFloat(avgSystolic),
          averageDiastolic: parseFloat(avgDiastolic),
          totalReadings: systolicReadings.length,
          moodCount: moodTrend.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vitals trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vitals trends',
      error: error.message
    });
  }
};

/**
 * GET /api/progress/:patientId
 * Get overall health trend analysis
 */
const getHealthTrendAnalysis = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get vitals
    const snapshots = await prisma.patient_progress_snapshots.findMany({
      where: {
        patient_id: patientId,
        recorded_at: { gte: startDate }
      },
      orderBy: { recorded_at: 'asc' }
    });

    // Get medication adherence
    const medications = await prisma.patient_medications.findMany({
      where: { patient_id: patientId, is_active: true },
      include: {
        catalog: true,
        adherence_logs: {
          where: { created_at: { gte: startDate } }
        }
      }
    });

    const medicationAdherence = medications.length > 0
      ? medications.reduce((sum, med) => {
          const taken = med.adherence_logs.filter(log => log.status === 'taken').length;
          const total = med.adherence_logs.length;
          return sum + (total > 0 ? taken / total : 0);
        }, 0) / medications.length * 100
      : 0;

    // Get exercise adherence
    const exercises = await prisma.patient_exercises.findMany({
      where: { patient_id: patientId, is_active: true },
      include: {
        catalog: true,
        adherence_logs: {
          where: { created_at: { gte: startDate } }
        }
      }
    });

    const exerciseAdherence = exercises.length > 0
      ? exercises.reduce((sum, ex) => {
          const completed = ex.adherence_logs.filter(log => log.status === 'taken').length;
          const total = ex.adherence_logs.length;
          return sum + (total > 0 ? completed / total : 0);
        }, 0) / exercises.length * 100
      : 0;

    // Get nutrition adherence
    const mealPlans = await prisma.patient_meal_plans.findMany({
      where: { patient_id: patientId, is_active: true },
      include: {
        meal_logs: {
          where: { created_at: { gte: startDate } }
        }
      }
    });

    const nutritionAdherence = mealPlans.length > 0
      ? mealPlans.reduce((sum, plan) => {
          const taken = plan.meal_logs.filter(log => log.status === 'taken').length;
          const total = plan.meal_logs.length;
          return sum + (total > 0 ? taken / total : 0);
        }, 0) / mealPlans.length * 100
      : 0;

    // Blood pressure stability check
    const systolicReadings = snapshots
      .filter(s => s.blood_pressure_systolic)
      .map(s => s.blood_pressure_systolic);
    
    let bpStability = 'Unknown';
    if (systolicReadings.length > 0) {
      const variance = Math.pow(
        systolicReadings.reduce((sum, val, _, arr) => {
          const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
          return sum + Math.pow(val - mean, 2);
        }, 0) / systolicReadings.length,
        0.5
      );
      
      if (variance < 10) bpStability = 'Very Stable';
      else if (variance < 20) bpStability = 'Stable';
      else if (variance < 30) bpStability = 'Moderate';
      else bpStability = 'Unstable';
    }

    res.status(200).json({
      success: true,
      data: {
        patientId,
        period: `${days} days`,
        overallHealth: {
          medicationAdherence: parseFloat(medicationAdherence.toFixed(2)),
          exerciseAdherence: parseFloat(exerciseAdherence.toFixed(2)),
          nutritionAdherence: parseFloat(nutritionAdherence.toFixed(2)),
          bloodPressureStability: bpStability
        },
        summary: {
          totalVitalsLogged: snapshots.length,
          activeMedications: medications.length,
          assignedExercises: exercises.length,
          activeMealPlans: mealPlans.length
        },
        recommendations: generateHealthRecommendations({
          medicationAdherence,
          exerciseAdherence,
          nutritionAdherence,
          bpStability
        })
      }
    });
  } catch (error) {
    console.error('Error fetching health trend analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health trend analysis',
      error: error.message
    });
  }
};

/**
 * Helper function untuk generate recommendations
 */
const generateHealthRecommendations = (health) => {
  const recommendations = [];

  if (health.medicationAdherence < 80) {
    recommendations.push('Tingkatkan kepatuhan minum obat - target 90%+');
  }
  if (health.exerciseAdherence < 75) {
    recommendations.push('Tingkatkan konsistensi latihan exercise');
  }
  if (health.nutritionAdherence < 80) {
    recommendations.push('Lebih ketat mengikuti meal plan yang ditetapkan');
  }
  if (health.bpStability === 'Unstable') {
    recommendations.push('Tekanan darah tidak stabil - konsultasi dengan dokter');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Pasien menunjukkan kepatuhan yang baik terhadap treatment plan');
  }

  return recommendations;
};

export {
  recordSnapshot,
  getSnapshots,
  getProgressReport,
  getPredictiveAlerts,
  logVitals,
  getVitalsTrends,
  getHealthTrendAnalysis
};
