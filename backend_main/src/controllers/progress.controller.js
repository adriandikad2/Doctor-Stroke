const progressService = require('../services/progress.service');

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

module.exports = {
  recordSnapshot,
  getSnapshots,
  getProgressReport,
  getPredictiveAlerts,
};
