import * as nutritionService from '../services/nutrition.service.js';

/**
 * Handle getting nutrition profile for a patient
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetProfile = async (req, res) => {
  try {
    const { patientId } = req.params;

    const profile = await nutritionService.getProfile(patientId);

    res.status(200).json({
      success: true,
      message: 'Profil nutrisi berhasil diambil',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil profil nutrisi',
    });
  }
};

/**
 * Handle updating nutrition profile for a patient
 * @param {object} req - Express request object with user, params, and body
 * @param {object} res - Express response object
 */
export const handleUpdateProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = req.body;
    const user = req.user;

    const updatedProfile = await nutritionService.updateProfile(patientId, data, user);

    res.status(200).json({
      success: true,
      message: 'Profil nutrisi berhasil diperbarui',
      data: updatedProfile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memperbarui profil nutrisi',
    });
  }
};

/**
 * Handle getting all nutrition profiles
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllProfiles = async (req, res) => {
  try {
    const profiles = await nutritionService.getAllProfiles();

    res.status(200).json({
      success: true,
      message: 'Semua profil nutrisi berhasil diambil',
      data: profiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil profil nutrisi',
    });
  }
};
