import prisma from '../config/db.js';
import * as userRepository from '../repositories/user.repository.js';
import * as profileRepository from '../repositories/profile.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.util.js';
import { createToken } from '../utils/jwt.util.js';

/**
 * Register a new user with a profile based on role
 * @param {object} userData - User registration data
 * @returns {Promise<object>} - The created user (without password_hash)
 * @throws {Error} - If user already exists or transaction fails
 */
export const registerUser = async (userData) => {
  const { email, password, role, first_name, last_name, ...profileData } = userData;

  // Check if user already exists
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const password_hash = await hashPassword(password);

  // Execute transaction: create user and corresponding profile
  const newUser = await prisma.$transaction(async (tx) => {
    // Create the user
    const user = await userRepository.createUser(
      {
        email,
        password_hash,
        role,
      },
      tx
    );

    // Create the corresponding profile based on role
    switch (user.role) {
      case 'doctor':
        await profileRepository.createDoctorProfile(
          {
            user_id: user.user_id,
            first_name,
            last_name,
            ...profileData,
          },
          tx
        );
        break;

      case 'therapist':
        await profileRepository.createTherapistProfile(
          {
            user_id: user.user_id,
            first_name,
            last_name,
            ...profileData,
          },
          tx
        );
        break;

      case 'family':
        await profileRepository.createFamilyProfile(
          {
            user_id: user.user_id,
            first_name,
            last_name,
            ...profileData,
          },
          tx
        );
        break;

      default:
        throw new Error('Invalid role provided');
    }

    return user;
  });

  // Return user without password hash
  const { password_hash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Login a user and generate a JWT token
 * @param {string} email - The user's email
 * @param {string} password - The user's password (plain text)
 * @returns {Promise<object>} - Object containing token and user info
 * @throws {Error} - If credentials are invalid
 */
export const loginUser = async (email, password) => {
  // Find user by email
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare passwords
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Create JWT token
  const payload = {
    user_id: user.user_id,
    role: user.role,
    email: user.email,
  };
  const token = createToken(payload);

  // Return token and user info (without password hash)
  return {
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    },
  };
};
