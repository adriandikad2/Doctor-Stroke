import * as logService from '../services/log.service.js';

/**
 * Handle creating a progress log entry
 * @param {object} req - Express request object with user and body
 * @param {object} res - Express response object
 */
export const handleCreateProgressLog = async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;

    const newLog = await logService.addProgressLog(data, user);

    res.status(201).json({
      success: true,
      message: 'Log perkembangan berhasil dibuat',
      data: newLog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat log perkembangan',
    });
  }
};

/**
 * Handle getting progress logs for a patient
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetProgressLogs = async (req, res) => {
  try {
    const { patientId } = req.params;

    const logs = await logService.getProgressLogs(patientId);

    res.status(200).json({
      success: true,
      message: 'Log perkembangan pasien berhasil diambil',
      data: logs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil log perkembangan',
    });
  }
};

/**
 * Handle creating a meal log entry
 * @param {object} req - Express request object with user and body
 * @param {object} res - Express response object
 */
export const handleCreateMealLog = async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;

    const newLog = await logService.addMealLog(data, user);

    res.status(201).json({
      success: true,
      message: 'Log makanan berhasil dibuat',
      data: newLog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat log makanan',
    });
  }
};

/**
 * Handle getting meal logs for a patient
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetMealLogs = async (req, res) => {
  try {
    const { patientId } = req.params;

    const logs = await logService.getMealLogs(patientId);

    res.status(200).json({
      success: true,
      message: 'Log makanan pasien berhasil diambil',
      data: logs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil log makanan',
    });
  }
};

/**
 * Handle creating a medication adherence log entry
 * @param {object} req - Express request object with user and body
 * @param {object} res - Express response object
 */
export const handleCreateAdherenceLog = async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;

    const newLog = await logService.addAdherenceLog(data, user);

    res.status(201).json({
      success: true,
      message: 'Log kepatuhan obat berhasil dibuat',
      data: newLog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat log kepatuhan obat',
    });
  }
};

/**
 * Handle getting medication adherence logs for a patient
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetAdherenceLogs = async (req, res) => {
  try {
    const { patientId } = req.params;

    const logs = await logService.getAdherenceLogs(patientId);

    res.status(200).json({
      success: true,
      message: 'Log kepatuhan obat pasien berhasil diambil',
      data: logs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil log kepatuhan obat',
    });
  }
};

/**
 * Handle creating a patient progress snapshot
 * @param {object} req - Express request object with user and body
 * @param {object} res - Express response object
 */
export const handleCreateSnapshotLog = async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;

    const newLog = await logService.addSnapshotLog(data, user);

    res.status(201).json({
      success: true,
      message: 'Snapshot perkembangan berhasil dibuat',
      data: newLog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat snapshot perkembangan',
    });
  }
};

/**
 * Handle getting patient progress snapshots
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetSnapshotLogs = async (req, res) => {
  try {
    const { patientId } = req.params;

    const logs = await logService.getSnapshotLogs(patientId);

    res.status(200).json({
      success: true,
      message: 'Snapshot perkembangan pasien berhasil diambil',
      data: logs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil snapshot perkembangan',
    });
  }
};

/**
 * Handle updating a progress log
 * @param {object} req - Express request object with user, params, and body
 * @param {object} res - Express response object
 */
export const handleUpdateProgressLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const { log_text } = req.body;
    const user = req.user;

    const updatedLog = await logService.updateProgressLog(logId, log_text, user);

    res.status(200).json({
      success: true,
      message: 'Log perkembangan berhasil diperbarui',
      data: updatedLog,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal memperbarui log perkembangan',
    });
  }
};

/**
 * Handle deleting a progress log
 * @param {object} req - Express request object with user and params
 * @param {object} res - Express response object
 */
export const handleDeleteProgressLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const user = req.user;

    const deletedLog = await logService.deleteProgressLog(logId, user);

    res.status(200).json({
      success: true,
      message: 'Log perkembangan berhasil dihapus',
      data: deletedLog,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal menghapus log perkembangan',
    });
  }
};

/**
 * Handle updating a meal log
 * @param {object} req - Express request object with user, params, and body
 * @param {object} res - Express response object
 */
export const handleUpdateMealLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const data = req.body;
    const user = req.user;

    const updatedLog = await logService.updateMealLog(logId, data, user);

    res.status(200).json({
      success: true,
      message: 'Log makanan berhasil diperbarui',
      data: updatedLog,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal memperbarui log makanan',
    });
  }
};

/**
 * Handle deleting a meal log
 * @param {object} req - Express request object with user and params
 * @param {object} res - Express response object
 */
export const handleDeleteMealLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const user = req.user;

    const deletedLog = await logService.deleteMealLog(logId, user);

    res.status(200).json({
      success: true,
      message: 'Log makanan berhasil dihapus',
      data: deletedLog,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal menghapus log makanan',
    });
  }
};

/**
 * Handle updating a medication adherence log
 * @param {object} req - Express request object with user, params, and body
 * @param {object} res - Express response object
 */
export const handleUpdateAdherenceLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const data = req.body;
    const user = req.user;

    const updatedLog = await logService.updateAdherenceLog(logId, data, user);

    res.status(200).json({
      success: true,
      message: 'Log kepatuhan obat berhasil diperbarui',
      data: updatedLog,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal memperbarui log kepatuhan obat',
    });
  }
};

/**
 * Handle deleting a medication adherence log
 * @param {object} req - Express request object with user and params
 * @param {object} res - Express response object
 */
export const handleDeleteAdherenceLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const user = req.user;

    const deletedLog = await logService.deleteAdherenceLog(logId, user);

    res.status(200).json({
      success: true,
      message: 'Log kepatuhan obat berhasil dihapus',
      data: deletedLog,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal menghapus log kepatuhan obat',
    });
  }
};

/**
 * Handle updating a patient progress snapshot
 * @param {object} req - Express request object with user, params, and body
 * @param {object} res - Express response object
 */
export const handleUpdateSnapshotLog = async (req, res) => {
  try {
    const { snapshotId } = req.params;
    const data = req.body;
    const user = req.user;

    const updatedLog = await logService.updateSnapshotLog(snapshotId, data, user);

    res.status(200).json({
      success: true,
      message: 'Snapshot perkembangan berhasil diperbarui',
      data: updatedLog,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal memperbarui snapshot perkembangan',
    });
  }
};

/**
 * Handle deleting a patient progress snapshot
 * @param {object} req - Express request object with user and params
 * @param {object} res - Express response object
 */
export const handleDeleteSnapshotLog = async (req, res) => {
  try {
    const { snapshotId } = req.params;
    const user = req.user;

    const deletedLog = await logService.deleteSnapshotLog(snapshotId, user);

    res.status(200).json({
      success: true,
      message: 'Snapshot perkembangan berhasil dihapus',
      data: deletedLog,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal menghapus snapshot perkembangan',
    });
  }
};

/**
 * Handle getting all progress logs (admin/testing endpoint)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllProgressLogs = async (req, res) => {
  try {
    const logs = await logService.getAllProgressLogs();

    res.status(200).json({
      success: true,
      message: 'Semua log perkembangan berhasil diambil',
      data: logs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil log perkembangan',
    });
  }
};

/**
 * Handle getting all meal logs (admin/testing endpoint)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllMealLogs = async (req, res) => {
  try {
    const logs = await logService.getAllMealLogs();

    res.status(200).json({
      success: true,
      message: 'Semua log makanan berhasil diambil',
      data: logs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil log makanan',
    });
  }
};

/**
 * Handle getting all medication adherence logs (admin/testing endpoint)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllAdherenceLogs = async (req, res) => {
  try {
    const logs = await logService.getAllAdherenceLogs();

    res.status(200).json({
      success: true,
      message: 'Semua log kepatuhan berhasil diambil',
      data: logs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil log kepatuhan',
    });
  }
};

/**
 * Handle getting all patient progress snapshots (admin/testing endpoint)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllSnapshotLogs = async (req, res) => {
  try {
    const logs = await logService.getAllSnapshotLogs();

    res.status(200).json({
      success: true,
      message: 'Semua snapshot perkembangan berhasil diambil',
      data: logs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil snapshot perkembangan',
    });
  }
};
