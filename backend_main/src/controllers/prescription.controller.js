const prescriptionService = require('../services/prescription.service');

const createPrescription = async (req, res) => {
  try {
    const prescription = await prescriptionService.createPrescription(req.body, req.user);
    res.status(201).json({
      message: 'Resep berhasil dibuat',
      prescription,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePrescription = async (req, res) => {
  try {
    const updated = await prescriptionService.updatePrescription(
      req.params.prescriptionId,
      req.body,
      req.user,
    );
    res.status(200).json({
      message: 'Resep diperbarui',
      prescription: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPrescriptionsForPatient = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const prescriptions = await prescriptionService.getPrescriptionsForPatient(
      req.params.patientId,
      req.user,
      includeInactive,
    );

    res.status(200).json({
      message: 'Daftar resep berhasil diambil',
      prescriptions,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePrescriptionStatus = async (req, res) => {
  try {
    const updated = await prescriptionService.togglePrescriptionStatus(
      req.params.prescriptionId,
      req.body.is_active,
      req.user,
    );
    res.status(200).json({
      message: 'Status resep diperbarui',
      prescription: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logAdherenceEvent = async (req, res) => {
  try {
    const record = await prescriptionService.logAdherence(
      req.params.prescriptionId,
      req.body,
      req.user,
    );
    res.status(201).json({
      message: 'Catatan kepatuhan tersimpan',
      adherence: record,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAdherenceSummary = async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days, 10) : 7;
    const summary = await prescriptionService.getAdherenceSummary(
      req.params.prescriptionId,
      req.user,
      days,
    );
    res.status(200).json(summary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const checkMedicationInteractions = async (req, res) => {
  try {
    const conflicts = await prescriptionService.checkInteractions(
      req.body.patient_id,
      req.body.medication_name,
      req.user,
      req.body.exclude_prescription_id,
    );
    res.status(200).json({
      medication: req.body.medication_name,
      conflicts,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUpcomingReminders = async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days, 10) : 3;
    const reminders = await prescriptionService.getUpcomingReminders(
      req.params.prescriptionId,
      req.user,
      days,
    );
    res.status(200).json({
      message: 'Reminder mendatang berhasil dihitung',
      reminders,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createPrescription,
  updatePrescription,
  getPrescriptionsForPatient,
  updatePrescriptionStatus,
  logAdherenceEvent,
  getAdherenceSummary,
  checkMedicationInteractions,
  getUpcomingReminders,
};
