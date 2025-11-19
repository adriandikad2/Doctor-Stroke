import * as prescriptionService from '../services/prescription.service.js';

/**
 * Handle creating a new prescription
 * @param {object} req - Express request object with user and body
 * @param {object} res - Express response object
 */
export const handleCreate = async (req, res) => {
  try {
    const prescriptionData = req.body;
    const user = req.user;

    if (!prescriptionData.patient_id || !prescriptionData.medication_name) {
      return res.status(400).json({
        success: false,
        message: 'patient_id dan medication_name diperlukan',
      });
    }

    const newPrescription = await prescriptionService.addNewPrescription(
      prescriptionData,
      user
    );

    res.status(201).json({
      success: true,
      message: 'Resep berhasil dibuat',
      data: newPrescription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat resep',
    });
  }
};

/**
 * Handle getting prescriptions by patient ID
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await prescriptionService.getPrescriptions(patientId);

    res.status(200).json({
      success: true,
      message: 'Resep pasien berhasil diambil',
      data: prescriptions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil resep',
    });
  }
};

/**
 * Handle updating a prescription
 * @param {object} req - Express request object with user, params, and body
 * @param {object} res - Express response object
 */
export const handleUpdate = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const data = req.body;
    const user = req.user;

    const updatedPrescription = await prescriptionService.updatePrescription(
      prescriptionId,
      data,
      user
    );

    res.status(200).json({
      success: true,
      message: 'Resep berhasil diperbarui',
      data: updatedPrescription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memperbarui resep',
    });
  }
};

/**
 * Handle deleting a prescription
 * @param {object} req - Express request object with user and params
 * @param {object} res - Express response object
 */
export const handleDelete = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const user = req.user;

    const deletedPrescription = await prescriptionService.deletePrescription(
      prescriptionId,
      user
    );

    res.status(200).json({
      success: true,
      message: 'Resep berhasil dihapus',
      data: deletedPrescription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus resep',
    });
  }
};

/**
 * Handle getting all prescriptions (admin/testing endpoint)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await prescriptionService.getAllPrescriptions();

    res.status(200).json({
      success: true,
      message: 'Semua resep berhasil diambil',
      data: prescriptions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil resep',
    });
  }
};
