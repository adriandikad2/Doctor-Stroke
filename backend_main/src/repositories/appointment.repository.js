import prisma from '../config/db.js';

/**
 * Create a new availability slot
 * @param {object} data - Slot data { medical_user_id, start_time, end_time }
 * @returns {Promise<object>} - The created availability slot
 */
export const createAvailabilitySlot = async (data) => {
  return prisma.availability_slots.create({
    data,
  });
};

/**
 * Find all available (not booked) slots for a medical user
 * @param {string} medicalUserId - The doctor/therapist user ID
 * @returns {Promise<array>} - Array of available slots
 */
export const findAvailableSlotsByMedicalUserId = async (medicalUserId) => {
  return prisma.availability_slots.findMany({
    where: {
      medical_user_id: medicalUserId,
      is_booked: false,
    },
    include: {
      medical_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
        },
      },
    },
  });
};

/**
 * Book a slot atomically (must be called within a transaction)
 * Locks the slot, marks it as booked, and creates appointment in one transaction
 * @param {string} slotId - The availability slot ID
 * @param {string} patientId - The patient ID
 * @param {string} familyUserId - The family user ID making the booking
 * @param {object} tx - The transaction object
 * @returns {Promise<object>} - The created appointment
 * @throws {Error} - If slot not found or already booked
 */
export const bookSlotInTransaction = async (slotId, patientId, familyUserId, tx) => {
  // Find and lock the slot (ensure it exists and is not booked)
  const slot = await tx.availability_slots.findFirst({
    where: {
      slot_id: slotId,
      is_booked: false,
    },
  });

  if (!slot) {
    throw new Error('Slot tidak ditemukan atau sudah dipesan');
  }

  // Update slot to mark as booked
  await tx.availability_slots.update({
    where: { slot_id: slotId },
    data: { is_booked: true },
  });

  // Create the appointment
  const newAppointment = await tx.appointments.create({
    data: {
      slot_id: slotId,
      patient_id: patientId,
      booked_by_user_id: familyUserId,
      status: 'scheduled',
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

  return newAppointment;
};

/**
 * Find appointment by ID with full details
 * @param {string} appointmentId - The appointment ID
 * @returns {Promise<object|null>} - The appointment with related data or null
 */
export const findAppointmentById = async (appointmentId) => {
  return prisma.appointments.findUnique({
    where: { appointment_id: appointmentId },
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
};

/**
 * Find all appointments for a patient
 * @param {string} patientId - The patient ID
 * @returns {Promise<array>} - Array of appointments for the patient
 */
export const findAppointmentsByPatientId = async (patientId) => {
  return prisma.appointments.findMany({
    where: { patient_id: patientId },
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
};

/**
 * Find all appointments made by a user (family member who booked)
 * @param {string} userId - The user ID
 * @returns {Promise<array>} - Array of appointments booked by the user
 */
export const findAppointmentsByBookedByUserId = async (userId) => {
  return prisma.appointments.findMany({
    where: { booked_by_user_id: userId },
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
};

/**
 * Find all slots created by a medical user
 * @param {string} medicalUserId - The doctor/therapist user ID
 * @returns {Promise<array>} - Array of all slots (booked and available)
 */
export const findAllSlotsByMedicalUserId = async (medicalUserId) => {
  return prisma.availability_slots.findMany({
    where: { medical_user_id: medicalUserId },
    include: {
      appointments: {
        include: {
          patient: true,
        },
      },
    },
  });
};

/**
 * Find all availability slots
 * @returns {Promise<array>} - Array of all availability slots
 */
export const findAllSlots = async () => {
  return prisma.availability_slots.findMany({
    include: {
      medical_user: {
        include: {
          doctor_profile: true,
          therapist_profile: true,
        },
      },
      appointments: {
        include: {
          patient: true,
        },
      },
    },
    orderBy: { start_time: 'asc' },
  });
};

/**
 * Find all appointments
 * @returns {Promise<array>} - Array of all appointments
 */
export const findAllAppointments = async () => {
  return prisma.appointments.findMany({
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
    orderBy: { created_at: 'desc' },
  });
};
