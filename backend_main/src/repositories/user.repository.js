import prisma from '../config/db.js';

/**
 * Find a user by email with all related profiles
 * @param {string} email - The user's email
 * @returns {Promise<object|null>} - The user object with profiles or null if not found
 */
export const findUserByEmail = async (email) => {
  return prisma.users.findUnique({
    where: { email },
    include: {
      doctor_profile: true,
      therapist_profile: true,
      family_profile: true,
    },
  });
};

/**
 * Find a user by ID with all related profiles
 * @param {string} userId - The user's ID
 * @returns {Promise<object|null>} - The user object with profiles or null if not found
 */
export const findUserById = async (userId) => {
  return prisma.users.findUnique({
    where: { user_id: userId },
    include: {
      doctor_profile: true,
      therapist_profile: true,
      family_profile: true,
    },
  });
};

/**
 * Get all users with their profiles
 * @returns {Promise<array>} - Array of all users with profiles
 */
export const findAllUsers = async () => {
  return prisma.users.findMany({
    include: {
      doctor_profile: true,
      therapist_profile: true,
      family_profile: true,
    },
  });
};

/**
 * Search users by name across all profile types
 * @param {string} name - The name to search for (first_name or last_name)
 * @returns {Promise<array>} - Array of matching users with profiles
 */
export const searchUsersByName = async (name) => {
  return prisma.users.findMany({
    where: {
      OR: [
        { doctor_profile: { first_name: { contains: name, mode: 'insensitive' } } },
        { doctor_profile: { last_name: { contains: name, mode: 'insensitive' } } },
        { therapist_profile: { first_name: { contains: name, mode: 'insensitive' } } },
        { therapist_profile: { last_name: { contains: name, mode: 'insensitive' } } },
        { family_profile: { first_name: { contains: name, mode: 'insensitive' } } },
        { family_profile: { last_name: { contains: name, mode: 'insensitive' } } },
      ],
    },
    include: {
      doctor_profile: true,
      therapist_profile: true,
      family_profile: true,
    },
  });
};

/**
 * Update a user's profile based on their role
 * @param {string} userId - The user's ID
 * @param {string} role - The user's role ('doctor', 'therapist', or 'family')
 * @param {object} data - The profile data to update
 * @returns {Promise<object>} - The updated user with profiles
 * @throws {Error} - If user not found or invalid role
 */
export const updateUserProfile = async (userId, role, data) => {
  let updateData = {};

  switch (role.toLowerCase()) {
    case 'doctor':
      updateData = {
        doctor_profile: {
          update: {
            first_name: data.first_name,
            last_name: data.last_name,
            specialization: data.specialization,
            license_number: data.license_number,
            hospital_name: data.hospital_name,
            phone_number: data.phone_number,
            profile_picture_url: data.profile_picture_url,
            bio: data.bio,
            ...Object.keys(data)
              .filter(
                (key) =>
                  ![
                    'first_name',
                    'last_name',
                    'specialization',
                    'license_number',
                    'hospital_name',
                    'phone_number',
                    'profile_picture_url',
                    'bio',
                  ].includes(key)
              )
              .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {}),
          },
        },
      };
      break;

    case 'therapist':
      updateData = {
        therapist_profile: {
          update: {
            first_name: data.first_name,
            last_name: data.last_name,
            specialization: data.specialization,
            license_number: data.license_number,
            clinic_name: data.clinic_name,
            phone_number: data.phone_number,
            profile_picture_url: data.profile_picture_url,
            bio: data.bio,
            ...Object.keys(data)
              .filter(
                (key) =>
                  ![
                    'first_name',
                    'last_name',
                    'specialization',
                    'license_number',
                    'clinic_name',
                    'phone_number',
                    'profile_picture_url',
                    'bio',
                  ].includes(key)
              )
              .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {}),
          },
        },
      };
      break;

    case 'family':
      updateData = {
        family_profile: {
          update: {
            first_name: data.first_name,
            last_name: data.last_name,
            relationship: data.relationship,
            phone_number: data.phone_number,
            profile_picture_url: data.profile_picture_url,
            bio: data.bio,
            ...Object.keys(data)
              .filter(
                (key) =>
                  ![
                    'first_name',
                    'last_name',
                    'relationship',
                    'phone_number',
                    'profile_picture_url',
                    'bio',
                  ].includes(key)
              )
              .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {}),
          },
        },
      };
      break;

    default:
      throw new Error('Invalid role provided');
  }

  return prisma.users.update({
    where: { user_id: userId },
    data: updateData,
    include: {
      doctor_profile: true,
      therapist_profile: true,
      family_profile: true,
    },
  });
};

/**
 * Delete a user and their associated profile (cascade delete handled by schema)
 * @param {string} userId - The user's ID
 * @returns {Promise<object>} - The deleted user object
 * @throws {Error} - If user not found
 */
export const deleteUser = async (userId) => {
  return prisma.users.delete({
    where: { user_id: userId },
    include: {
      doctor_profile: true,
      therapist_profile: true,
      family_profile: true,
    },
  });
};

/**
 * Create a new user (must be called within a transaction)
 * @param {object} userData - User data (email, password_hash, role)
 * @param {object} tx - The transaction object
 * @returns {Promise<object>} - The created user object
 */
export const createUser = async (userData, tx) => {
  return tx.users.create({
    data: userData,
  });
};
