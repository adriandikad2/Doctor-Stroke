import * as userService from '../services/user.service.js';

/**
 * Handle getting a user by ID
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID diperlukan',
      });
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User berhasil diambil',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil user',
    });
  }
};

/**
 * Handle searching users by name
 * @param {object} req - Express request object with query
 * @param {object} res - Express response object
 */
export const handleSearchUsersByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Parameter pencarian "name" diperlukan',
      });
    }

    const users = await userService.searchByName(name);

    res.status(200).json({
      success: true,
      message: 'User berhasil dicari',
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mencari user',
    });
  }
};
