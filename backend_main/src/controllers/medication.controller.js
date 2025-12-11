import * as medicationCatalogService from '../services/medication-catalog.service.js';

/**
 * Legacy medication schedule handlers (deprecated)
 */
export const handleCreateSchedule = async (_req, res) => {
  res.status(410).json({
    success: false,
    message: 'Endpoint deprecated. Gunakan /api/medications/prescribe atau katalog obat.',
  });
};

export const handleGetSchedules = async (_req, res) => {
  res.status(410).json({
    success: false,
    message: 'Endpoint deprecated. Gunakan /api/medication-catalogs/patient/:patientId',
  });
};

export const handleUpdateSchedule = async (_req, res) => {
  res.status(410).json({
    success: false,
    message: 'Endpoint deprecated. Gunakan /api/medications/:patientMedId',
  });
};

export const handleDeleteSchedule = async (_req, res) => {
  res.status(410).json({
    success: false,
    message: 'Endpoint deprecated. Gunakan /api/medications/:patientMedId',
  });
};

/**
 * Katalog obat
 */
export const handleGetMedicationCatalog = async (_req, res) => {
  try {
    const meds = await medicationCatalogService.getAllCatalogs();
    res.status(200).json({
      success: true,
      message: 'Katalog obat berhasil diambil',
      data: meds,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal mengambil katalog obat' });
  }
};

export const handleGetMedicationDetail = async (req, res) => {
  try {
    const catalog = await medicationCatalogService.getCatalogById(req.params.catalogId);
    res.status(200).json({
      success: true,
      message: 'Detail obat berhasil diambil',
      data: catalog,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message || 'Obat tidak ditemukan' });
  }
};

/**
 * Assign/prescribe medication from catalog
 */
export const handlePrescribeMedication = async (req, res) => {
  try {
    const { catalog_id, patient_id } = req.body;
    if (!catalog_id || !patient_id) {
      return res.status(400).json({ success: false, message: 'catalog_id dan patient_id diperlukan' });
    }

    const patientMed = await medicationCatalogService.assignToPatient(
      catalog_id,
      patient_id,
      req.user.user_id
    );

    res.status(201).json({
      success: true,
      message: 'Obat berhasil ditambahkan ke pasien',
      data: patientMed,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal menambahkan obat' });
  }
};

export const handleGetPatientMedications = async (req, res) => {
  try {
    const meds = await medicationCatalogService.getPatientMedications(req.params.patientId);
    res.status(200).json({
      success: true,
      message: 'Obat pasien berhasil diambil',
      data: meds,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal mengambil obat pasien' });
  }
};

export const handleUpdatePatientMedication = async (req, res) => {
  try {
    const updated = await medicationCatalogService.updatePatientMedication(req.params.patientMedId, req.body);
    res.status(200).json({
      success: true,
      message: 'Penugasan obat diperbarui',
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal memperbarui penugasan obat' });
  }
};

export const handleDeletePatientMedication = async (req, res) => {
  try {
    await medicationCatalogService.removePatientMedication(req.params.patientMedId);
    res.status(200).json({
      success: true,
      message: 'Penugasan obat dihapus',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal menghapus penugasan obat' });
  }
};

/**
 * Adherence logging + stats
 */
export const handleLogMedicationAdherence = async (req, res) => {
  try {
    const payload = { ...req.body, logged_by_user_id: req.user.user_id };
    const log = await medicationCatalogService.logAdherence(payload);
    res.status(201).json({
      success: true,
      message: 'Log kepatuhan obat tersimpan',
      data: log,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal menyimpan log' });
  }
};

export const handleGetMedicationAdherence = async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const stats = await medicationCatalogService.getAdherenceStats(req.params.patientId, startDate, endDate);

    res.status(200).json({
      success: true,
      message: 'Statistik kepatuhan obat berhasil diambil',
      data: stats,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal mengambil statistik' });
  }
};
