import * as appointmentService from '../services/appointment.service.js';

/**
 * Handle creating a new availability slot
 * @param {object} req - Express request object with user and body
 * @param {object} res - Express response object
 */
export const handleCreateSlot = async (req, res) => {
  try {
    const slotData = req.body;
    const user = req.user;

    if (!slotData.start_time || !slotData.end_time) {
      return res.status(400).json({
        success: false,
        message: 'start_time dan end_time diperlukan',
      });
    }

    const newSlot = await appointmentService.createSlot(slotData, user);

    res.status(201).json({
      success: true,
      message: 'Slot ketersediaan berhasil dibuat',
      data: newSlot,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat slot',
    });
  }
};

/**
 * Handle getting available slots for a medical user
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetAvailableSlots = async (req, res) => {
  try {
    const { medicalUserId } = req.params;

    if (!medicalUserId) {
      return res.status(400).json({
        success: false,
        message: 'medicalUserId diperlukan',
      });
    }

    const slots = await appointmentService.getAvailableSlots(medicalUserId);

    res.status(200).json({
      success: true,
      message: 'Slot ketersediaan berhasil diambil',
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil slot',
    });
  }
};

/**
 * Handle booking an appointment
 * @param {object} req - Express request object with user and body
 * @param {object} res - Express response object
 */
export const handleBookAppointment = async (req, res) => {
  try {
    const { slot_id, patient_id } = req.body;
    const user = req.user;

    if (!slot_id || !patient_id) {
      return res.status(400).json({
        success: false,
        message: 'slot_id dan patient_id diperlukan',
      });
    }

    const newAppointment = await appointmentService.bookAppointment(slot_id, patient_id, user);

    res.status(201).json({
      success: true,
      message: 'Janji temu berhasil dipesan',
      data: newAppointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memesan janji temu',
    });
  }
};

/**
 * Handle getting appointments for a patient
 * @param {object} req - Express request object with params
 * @param {object} res - Express response object
 */
export const handleGetAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'patientId diperlukan',
      });
    }

    const appointments = await appointmentService.getAppointmentsByPatient(patientId);

    res.status(200).json({
      success: true,
      message: 'Janji temu pasien berhasil diambil',
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil janji temu',
    });
  }
};

/**
 * Handle getting appointments booked by the authenticated user
 * @param {object} req - Express request object with user
 * @param {object} res - Express response object
 */
export const handleGetMyAppointments = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const appointments = await appointmentService.getMyAppointments(userId);

    res.status(200).json({
      success: true,
      message: 'Janji temu saya berhasil diambil',
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil janji temu',
    });
  }
};

/**
 * Handle getting all slots created by the authenticated medical user
 * @param {object} req - Express request object with user
 * @param {object} res - Express response object
 */
export const handleGetMySlots = async (req, res) => {
  try {
    const medicalUserId = req.user.user_id;

    const slots = await appointmentService.getMySlots(medicalUserId);

    res.status(200).json({
      success: true,
      message: 'Slot saya berhasil diambil',
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil slot',
    });
  }
};

/**
 * Handle getting all appointment slots (admin/testing endpoint)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllSlots = async (req, res) => {
  try {
    const slots = await appointmentService.getAllSlots();

    res.status(200).json({
      success: true,
      message: 'Semua slot ketersediaan berhasil diambil',
      data: slots,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil slot',
    });
  }
};

/**
 * Handle getting all appointments (admin/testing endpoint)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const handleGetAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments();

    res.status(200).json({
      success: true,
      message: 'Semua janji temu berhasil diambil',
      data: appointments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil janji temu',
    });
  }
};
