import * as nutritionCatalogService from '../services/nutrition-catalog.service.js';

/**
 * Handle creating a new nutrition catalog
 */
export const handleCreateCatalog = async (req, res) => {
  try {
    const catalogData = req.body;

    if (!catalogData.food_name || !catalogData.food_category) {
      return res.status(400).json({
        success: false,
        message: 'food_name dan food_category diperlukan',
      });
    }

    const newCatalog = await nutritionCatalogService.createCatalog(catalogData);

    res.status(201).json({
      success: true,
      message: 'Katalog makanan berhasil dibuat',
      data: newCatalog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat katalog makanan',
    });
  }
};

/**
 * Handle getting all nutrition catalogs
 */
export const handleGetAllCatalogs = async (req, res) => {
  try {
    const catalogs = await nutritionCatalogService.getAllCatalogs();

    res.status(200).json({
      success: true,
      message: 'Semua katalog makanan berhasil diambil',
      data: catalogs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil katalog makanan',
    });
  }
};

/**
 * Handle getting nutrition catalogs by category
 */
export const handleGetByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const catalogs = await nutritionCatalogService.getByCategory(category);

    res.status(200).json({
      success: true,
      message: 'Katalog makanan berhasil diambil',
      data: catalogs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil katalog makanan',
    });
  }
};

/**
 * Handle getting a specific nutrition catalog
 */
export const handleGetCatalogById = async (req, res) => {
  try {
    const { catalogId } = req.params;

    const catalog = await nutritionCatalogService.getCatalogById(catalogId);

    res.status(200).json({
      success: true,
      message: 'Katalog makanan berhasil diambil',
      data: catalog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil katalog makanan',
    });
  }
};

/**
 * Handle updating a nutrition catalog
 */
export const handleUpdateCatalog = async (req, res) => {
  try {
    const { catalogId } = req.params;
    const catalogData = req.body;

    const updatedCatalog = await nutritionCatalogService.updateCatalog(
      catalogId,
      catalogData
    );

    res.status(200).json({
      success: true,
      message: 'Katalog makanan berhasil diperbarui',
      data: updatedCatalog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memperbarui katalog makanan',
    });
  }
};

/**
 * Handle deleting a nutrition catalog
 */
export const handleDeleteCatalog = async (req, res) => {
  try {
    const { catalogId } = req.params;

    await nutritionCatalogService.deleteCatalog(catalogId);

    res.status(200).json({
      success: true,
      message: 'Katalog makanan berhasil dihapus',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus katalog makanan',
    });
  }
};

/**
 * Handle assigning a nutrition food to a patient
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

    const patientFood = await nutritionCatalogService.assignToPatient(
      catalogId,
      patient_id,
      user.user_id
    );

    res.status(201).json({
      success: true,
      message: 'Makanan berhasil ditambahkan untuk pasien',
      data: patientFood,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menambahkan makanan untuk pasien',
    });
  }
};

/**
 * Handle getting all nutrition foods for a patient
 */
export const handleGetPatientFoods = async (req, res) => {
  try {
    const { patientId } = req.params;

    const foods = await nutritionCatalogService.getPatientFoods(patientId);

    res.status(200).json({
      success: true,
      message: 'Makanan pasien berhasil diambil',
      data: foods,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil makanan pasien',
    });
  }
};

/**
 * Handle removing a nutrition food from a patient
 */
export const handleRemovePatientFood = async (req, res) => {
  try {
    const { patientFoodId } = req.params;

    await nutritionCatalogService.removePatientFood(patientFoodId);

    res.status(200).json({
      success: true,
      message: 'Makanan berhasil dihapus dari pasien',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus makanan dari pasien',
    });
  }
};

/**
 * Handle logging nutrition adherence (taken/missed)
 */
export const handleLogAdherence = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      logged_by_user_id: req.user.user_id,
    };
    const log = await nutritionCatalogService.logAdherence(payload);

    res.status(201).json({
      success: true,
      message: 'Log kepatuhan nutrisi tersimpan',
      data: log,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menyimpan log nutrisi',
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

    const stats = await nutritionCatalogService.getAdherenceStats(patientId, startDate, endDate);

    res.status(200).json({
      success: true,
      message: 'Statistik kepatuhan nutrisi berhasil diambil',
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil statistik nutrisi',
    });
  }
};
