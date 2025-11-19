import * as userRepository from '../repositories/user.repository.js';

/**
 * Get a user by ID
 * @param {string} userId - The user's ID
 * @returns {Promise<object|null>} - The user with profiles or null if not found
 */
export const getUserById = async (userId) => {
  return userRepository.findUserById(userId);
};

/**
 * Get all users
 * @returns {Promise<array>} - Array of all users with profiles
 */
export const getAllUsers = async () => {
  return userRepository.findAllUsers();
};

/**
 * Search users by name
 * @param {string} name - The name to search for
 * @returns {Promise<array>} - Array of matching users with profiles
 * @throws {Error} - If name is empty
 */
export const searchByName = async (name) => {
  if (!name || name.trim().length === 0) {
    throw new Error('Search name cannot be empty');
  }
  return userRepository.searchUsersByName(name.trim());
};

/**
 * Update a user's profile
 * @param {string} userId - The user's ID
 * @param {string} role - The user's role
 * @param {object} profileData - The profile data to update
 * @returns {Promise<object>} - The updated user with profiles
 * @throws {Error} - If user not found or invalid role
 */
export const updateProfile = async (userId, role, profileData) => {
  // Validate userId
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Check if user exists
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Validate role matches user's role
  if (user.role !== role) {
    throw new Error('Role mismatch');
  }

  // Update the profile
  return userRepository.updateUserProfile(userId, role, profileData);
};

/**
 * Delete a user account
 * @param {string} userId - The user's ID
 * @returns {Promise<object>} - The deleted user object
 * @throws {Error} - If user not found
 */
export const deleteAccount = async (userId) => {
  // Check if user exists
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Delete the user (profiles will cascade delete)
  return userRepository.deleteUser(userId);
};

/**
 * Get user by email
 * @param {string} email - The user's email
 * @returns {Promise<object|null>} - The user with profiles or null if not found
 */
export const getUserByEmail = async (email) => {
  if (!email || email.trim().length === 0) {
    throw new Error('Email cannot be empty');
  }
  return userRepository.findUserByEmail(email.trim());
};
