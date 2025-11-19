import * as careTeamService from '../services/care_team.service.js';

/**
 * Handle getting care team for a patient
 * @param {object} req - Express request object with user and params
 * @param {object} res - Express response object
 */
export const handleGetTeam = async (req, res) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    const team = await careTeamService.getTeamForPatient(patientId, user);

    res.status(200).json({
      success: true,
      message: 'Tim perawatan pasien berhasil diambil',
      data: team,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal mengambil tim perawatan',
    });
  }
};

/**
 * Handle removing a member from care team
 * @param {object} req - Express request object with user and params
 * @param {object} res - Express response object
 */
export const handleRemoveMember = async (req, res) => {
  try {
    const { linkId } = req.params;
    const user = req.user;

    const removedMember = await careTeamService.removeMember(linkId, user);

    res.status(200).json({
      success: true,
      message: 'Anggota tim berhasil dihapus',
      data: removedMember,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal menghapus anggota tim',
    });
  }
};

/**
 * Handle getting all care team links (admin/testing endpoint)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllCareTeamLinks = async (req, res) => {
  try {
    const links = await careTeamService.getAllCareTeamLinks();

    res.status(200).json({
      success: true,
      message: 'Semua tautan tim perawatan berhasil diambil',
      data: links,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil tautan tim perawatan',
    });
  }
};
