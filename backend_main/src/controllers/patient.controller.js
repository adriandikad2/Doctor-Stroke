import * as patientService from '../services/patient.service.js';

/**
 * Handle patient profile creation
 * @param {object} req - Express request object with user and body
 * @param {object} res - Express response object
 */
export const handleCreatePatient = async (req, res) => {
  try {
    const patientData = req.body;
    const user = req.user;

    const newPatient = await patientService.createNewPatient(patientData, user);

    res.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      data: newPatient,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create patient profile',
    });
  }
};

/**
 * Handle linking a medical team member to a patient
 * @param {object} req - Express request object with user and body
 * @param {object} res - Express response object
 */
export const handleLinkPatient = async (req, res) => {
  try {
    const { unique_code } = req.body;
    const user = req.user;

    if (!unique_code) {
      return res.status(400).json({
        success: false,
        message: 'Patient code (unique_code) is required',
      });
    }

    const patient = await patientService.linkMedicalTeamToPatient(unique_code, user);

    res.status(200).json({
      success: true,
      message: 'Successfully linked to patient',
      data: patient,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to link patient',
    });
  }
};

/**
 * Handle getting all patients for the authenticated user (Dashboard)
 * @param {object} req - Express request object with user
 * @param {object} res - Express response object
 */
export const handleGetMyPatients = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const patients = await patientService.getMyPatients(userId);

    res.status(200).json({
      success: true,
      message: 'Patients retrieved successfully',
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve patients',
    });
  }
};

/**
 * Handle getting a specific patient by ID
 * @param {object} req - Express request object with user and params
 * @param {object} res - Express response object
 */
export const handleGetPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID diperlukan',
      });
    }

    const patient = await patientService.getPatientDetails(id, user);

    res.status(200).json({
      success: true,
      message: 'Pasien berhasil diambil',
      data: patient,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal mengambil detail pasien',
    });
  }
};

/**
 * Handle updating a patient profile
 * @param {object} req - Express request object with user, params, and body
 * @param {object} res - Express response object
 */
export const handleUpdatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const user = req.user;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID diperlukan',
      });
    }

    const updatedPatient = await patientService.updatePatientDetails(id, data, user);

    res.status(200).json({
      success: true,
      message: 'Pasien berhasil diperbarui',
      data: updatedPatient,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal memperbarui pasien',
    });
  }
};

/**
 * Handle deleting a patient profile
 * @param {object} req - Express request object with user and params
 * @param {object} res - Express response object
 */
export const handleDeletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID diperlukan',
      });
    }

    const deletedPatient = await patientService.deletePatientProfile(id, user);

    res.status(200).json({
      success: true,
      message: 'Pasien berhasil dihapus',
      data: deletedPatient,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || 'Gagal menghapus pasien',
    });
  }
};

/**
 * Handle getting all patient profiles (admin/testing endpoint)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllPatientProfiles = async (req, res) => {
  try {
    const patients = await patientService.getAllPatientProfiles();

    res.status(200).json({
      success: true,
      message: 'Semua profil pasien berhasil diambil',
      data: patients,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil profil pasien',
    });
  }
};
