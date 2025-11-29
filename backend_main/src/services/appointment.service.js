import prisma from '../config/db.js';
import * as appointmentRepository from '../repositories/appointment.repository.js';

/**
 * Create a new availability slot (doctor/therapist only)
 * @param {object} slotData - Slot data { start_time, end_time, day_of_week }
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The created availability slot
 * @throws {Error} - If user is not a doctor or therapist
 */
export const createSlot = async (slotData, user) => {
  // Only doctors and therapists can create slots
  if (user.role === 'family') {
    throw new Error('Hanya dokter/terapis yang bisa membuat slot');
  }

  return appointmentRepository.createAvailabilitySlot({
    ...slotData,
    medical_user_id: user.user_id,
  });
};

/**
 * Get all available slots for a medical user
 * @param {string} medicalUserId - The doctor/therapist user ID
 * @returns {Promise<array>} - Array of available slots
 */
export const getAvailableSlots = async (medicalUserId) => {
  return appointmentRepository.findAvailableSlotsByMedicalUserId(medicalUserId);
};

/**
 * Book an appointment (family member only)
 * Uses a transaction to prevent double-booking
 * @param {string} slotId - The availability slot ID
 * @param {string} patientId - The patient ID
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The created appointment
 * @throws {Error} - If user is not family, slot not found, or already booked
 */
export const bookAppointment = async (slotId, patientId, user) => {
  // Only family members can book appointments
  if (user.role !== 'family') {
    throw new Error('Hanya keluarga yang bisa memesan janji temu');
  }

  const familyUserId = user.user_id;

  // Execute transaction: book slot and create appointment atomically
  const newAppointment = await prisma.$transaction(async (tx) => {
    return appointmentRepository.bookSlotInTransaction(slotId, patientId, familyUserId, tx);
  });

  return newAppointment;
};

/**
 * Create a direct appointment (doctor/therapist only)
 * Bypasses the booking slot system for doctors/therapists to directly create appointments
 * @param {object} data - Appointment data { patient_id, start_time, end_time, notes }
 * @param {object} user - Authenticated user { user_id, role }
 * @returns {Promise<object>} - The created appointment
 * @throws {Error} - If user is family or not authorized, or missing required data
 */
export const createDirectAppointment = async (data, user) => {
  // Only doctors and therapists can create direct appointments
  if (user.role === 'family') {
    throw new Error('Keluarga harus menggunakan sistem booking slot');
  }

  const { patient_id, start_time, end_time, notes } = data;

  // Validate required fields
  if (!patient_id || !start_time || !end_time) {
    throw new Error('patient_id, start_time, dan end_time diperlukan');
  }

  // Execute transaction: create availability slot and appointment atomically
  const newAppointment = await prisma.$transaction(async (tx) => {
    // Create availability slot marked as booked
    const slot = await tx.availability_slots.create({
      data: {
        medical_user_id: user.user_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        is_booked: true,
      },
    });

    // Create appointment linked to the slot and patient
    const appointment = await tx.appointments.create({
      data: {
        slot_id: slot.slot_id,
        patient_id,
        booked_by_user_id: user.user_id,
        status: 'scheduled',
        notes,
      },
      include: {
        slot: {
          include: {
            medical_user: {
              include: {
                doctor_profile: true,
                therapist_profile: true,
              },
            },
          },
        },
        patient: true,
      },
    });

    return appointment;
  });

  return newAppointment;
};

/**
 * Get all appointments for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of appointments
 */
export const getAppointmentsByPatient = async (patientId) => {
  return appointmentRepository.findAppointmentsByPatientId(patientId);
};

/**
 * Get all appointments booked by a user
 * @param {string} userId - The user ID
 * @returns {Promise<array>} - Array of appointments booked by the user
 */
export const getMyAppointments = async (userId) => {
  return appointmentRepository.findAppointmentsByBookedByUserId(userId);
};

/**
 * Get all slots created by a medical user
 * @param {string} medicalUserId - The doctor/therapist user ID
 * @returns {Promise<array>} - Array of all slots
 */
export const getMySlots = async (medicalUserId) => {
  return await prisma.availability_slots.findMany({
    where: {
      medical_user_id: medicalUserId,
    },
    include: {
      // UBAH DARI 'appointments' MENJADI 'appointment'
      appointment: { 
        include: {
          patient: true, // Untuk mengambil data pasien jika slot sudah di-book
        },
      },
    },
    orderBy: {
      start_time: 'asc',
    },
  });
};

/**
 * Get all availability slots (admin/testing endpoint)
 * @returns {Promise<array>} - Array of all slots
 */
export const getAllSlots = async () => {
  return appointmentRepository.findAllSlots();
};

/**
 * Get all appointments (admin/testing endpoint)
 * @returns {Promise<array>} - Array of all appointments
 */
export const getAllAppointments = async () => {
  return appointmentRepository.findAllAppointments();
};
