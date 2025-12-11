import * as exerciseCatalogService from '../services/exercise-catalog.service.js';

/**
 * Handle creating a new exercise catalog
 */
export const handleCreateCatalog = async (req, res) => {
  try {
    const catalogData = req.body;

    if (!catalogData.exercise_name || !catalogData.specialization) {
      return res.status(400).json({
        success: false,
        message: 'exercise_name dan specialization diperlukan',
      });
    }

    const newCatalog = await exerciseCatalogService.createCatalog(catalogData);

    res.status(201).json({
      success: true,
      message: 'Katalog latihan berhasil dibuat',
      data: newCatalog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat katalog latihan',
    });
  }
};

/**
 * Handle getting all exercise catalogs
 */
export const handleGetAllCatalogs = async (req, res) => {
  try {
    const catalogs = await exerciseCatalogService.getAllCatalogs();

    res.status(200).json({
      success: true,
      message: 'Semua katalog latihan berhasil diambil',
      data: catalogs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil katalog latihan',
    });
  }
};

/**
 * Handle getting exercise catalogs by specialization
 */
export const handleGetBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;

    const catalogs = await exerciseCatalogService.getBySpecialization(specialization);

    res.status(200).json({
      success: true,
      message: 'Katalog latihan berhasil diambil',
      data: catalogs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil katalog latihan',
    });
  }
};

/**
 * Handle getting a specific exercise catalog
 */
export const handleGetCatalogById = async (req, res) => {
  try {
    const { catalogId } = req.params;

    const catalog = await exerciseCatalogService.getCatalogById(catalogId);

    res.status(200).json({
      success: true,
      message: 'Katalog latihan berhasil diambil',
      data: catalog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil katalog latihan',
    });
  }
};

/**
 * Handle updating an exercise catalog
 */
export const handleUpdateCatalog = async (req, res) => {
  try {
    const { catalogId } = req.params;
    const catalogData = req.body;

    const updatedCatalog = await exerciseCatalogService.updateCatalog(
      catalogId,
      catalogData
    );

    res.status(200).json({
      success: true,
      message: 'Katalog latihan berhasil diperbarui',
      data: updatedCatalog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memperbarui katalog latihan',
    });
  }
};

/**
 * Handle deleting an exercise catalog
 */
export const handleDeleteCatalog = async (req, res) => {
  try {
    const { catalogId } = req.params;

    await exerciseCatalogService.deleteCatalog(catalogId);

    res.status(200).json({
      success: true,
      message: 'Katalog latihan berhasil dihapus',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus katalog latihan',
    });
  }
};

/**
 * Handle assigning an exercise catalog to a patient
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

    const patientEx = await exerciseCatalogService.assignToPatient(
      catalogId,
      patient_id,
      user.user_id
    );

    res.status(201).json({
      success: true,
      message: 'Latihan berhasil ditambahkan untuk pasien',
      data: patientEx,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menambahkan latihan untuk pasien',
    });
  }
};

/**
 * Handle getting all exercises for a patient
 */
export const handleGetPatientExercises = async (req, res) => {
  try {
    const { patientId } = req.params;

    const exercises = await exerciseCatalogService.getPatientExercises(patientId);

    res.status(200).json({
      success: true,
      message: 'Latihan pasien berhasil diambil',
      data: exercises,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil latihan pasien',
    });
  }
};

/**
 * Handle removing an exercise from a patient
 */
export const handleRemovePatientExercise = async (req, res) => {
  try {
    const { patientExId } = req.params;

    await exerciseCatalogService.removePatientExercise(patientExId);

    res.status(200).json({
      success: true,
      message: 'Latihan berhasil dihapus dari pasien',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus latihan dari pasien',
    });
  }
};

/**
 * Handle logging exercise adherence (taken/missed)
 */
export const handleLogAdherence = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      logged_by_user_id: req.user.user_id,
    };
    const log = await exerciseCatalogService.logAdherence(payload);

    res.status(201).json({
      success: true,
      message: 'Log kepatuhan latihan tersimpan',
      data: log,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menyimpan log latihan',
    });
  }
};

/**
 * Handle retrieving adherence stats for a patient
 */
export const handleGetAdherence = async (req, res) => {
  try {
    const { patientId } = req.params;
    const days = parseInt(req.query.days || '30', 10);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const stats = await exerciseCatalogService.getAdherenceStats(patientId, startDate, endDate);

    res.status(200).json({
      success: true,
      message: 'Statistik kepatuhan latihan berhasil diambil',
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil statistik latihan',
    });
  }
};
