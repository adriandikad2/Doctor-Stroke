import * as medicationCatalogService from '../services/medication-catalog.service.js';

/**
 * Handle creating a new medication catalog
 */
export const handleCreateCatalog = async (req, res) => {
  try {
    const catalogData = req.body;

    if (!catalogData.medication_name) {
      return res.status(400).json({
        success: false,
        message: 'medication_name diperlukan',
      });
    }

    const newCatalog = await medicationCatalogService.createCatalog(catalogData);

    res.status(201).json({
      success: true,
      message: 'Katalog obat berhasil dibuat',
      data: newCatalog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat katalog obat',
    });
  }
};

/**
 * Handle getting all medication catalogs
 */
export const handleGetAllCatalogs = async (req, res) => {
  try {
    const catalogs = await medicationCatalogService.getAllCatalogs();

    res.status(200).json({
      success: true,
      message: 'Semua katalog obat berhasil diambil',
      data: catalogs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil katalog obat',
    });
  }
};

/**
 * Handle getting a specific medication catalog
 */
export const handleGetCatalogById = async (req, res) => {
  try {
    const { catalogId } = req.params;

    const catalog = await medicationCatalogService.getCatalogById(catalogId);

    res.status(200).json({
      success: true,
      message: 'Katalog obat berhasil diambil',
      data: catalog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil katalog obat',
    });
  }
};

/**
 * Handle updating a medication catalog
 */
export const handleUpdateCatalog = async (req, res) => {
  try {
    const { catalogId } = req.params;
    const catalogData = req.body;

    const updatedCatalog = await medicationCatalogService.updateCatalog(
      catalogId,
      catalogData
    );

    res.status(200).json({
      success: true,
      message: 'Katalog obat berhasil diperbarui',
      data: updatedCatalog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memperbarui katalog obat',
    });
  }
};

/**
 * Handle deleting a medication catalog
 */
export const handleDeleteCatalog = async (req, res) => {
  try {
    const { catalogId } = req.params;

    await medicationCatalogService.deleteCatalog(catalogId);

    res.status(200).json({
      success: true,
      message: 'Katalog obat berhasil dihapus',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus katalog obat',
    });
  }
};

/**
 * Handle assigning a medication catalog to a patient
 */
export const handleAssignToPatient = async (req, res) => {
  try {
    const { catalogId } = req.params;
    const { patient_id } = req.body;
    const user = req.user;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'patient_id diperlukan',
      });
    }

    const patientMed = await medicationCatalogService.assignToPatient(
      catalogId,
      patient_id,
      user.user_id
    );

    res.status(201).json({
      success: true,
      message: 'Obat berhasil ditambahkan untuk pasien',
      data: patientMed,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menambahkan obat untuk pasien',
    });
  }
};

/**
 * Handle getting all medications for a patient
 */
export const handleGetPatientMedications = async (req, res) => {
  try {
    const { patientId } = req.params;

    const medications = await medicationCatalogService.getPatientMedications(patientId);

    res.status(200).json({
      success: true,
      message: 'Obat pasien berhasil diambil',
      data: medications,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil obat pasien',
    });
  }
};

/**
 * Handle removing a medication from a patient
 */
export const handleRemovePatientMedication = async (req, res) => {
  try {
    const { patientMedId } = req.params;

    await medicationCatalogService.removePatientMedication(patientMedId);

    res.status(200).json({
      success: true,
      message: 'Obat berhasil dihapus dari pasien',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus obat dari pasien',
    });
  }
};

/**
 * Handle logging medication adherence
 */
export const handleLogAdherence = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      logged_by_user_id: req.user.user_id,
    };

    const log = await medicationCatalogService.logAdherence(payload);

    res.status(201).json({
      success: true,
      message: 'Log kepatuhan obat tersimpan',
      data: log,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menyimpan log obat',
    });
  }
};

/**
 * Handle getting medication adherence stats
 */
export const handleGetAdherence = async (req, res) => {
  try {
    const { patientId } = req.params;
    const days = parseInt(req.query.days || '30', 10);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const stats = await medicationCatalogService.getAdherenceStats(patientId, startDate, endDate);

    res.status(200).json({
      success: true,
      message: 'Statistik kepatuhan obat berhasil diambil',
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil statistik obat',
    });
  }
};
