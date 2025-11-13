const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/hash.util');
const { createToken } = require('../utils/jwt.util');
const { randomUUID } = require('crypto');

const registerUser = async (userData) => {
  const { name, email, password, role, specialty } = userData;

  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    user_id: randomUUID(),
    name,
    email,
    password_hash: hashedPassword, // Changed from 'password' to 'password_hash'
    role: role || 'caregiver', // Default role
    specialty: specialty || null
  };

  const createdUser = await userRepository.createUser(newUser);
  delete createdUser.password_hash; // Don't return the password hash
  return createdUser;
};

const loginUser = async (email, password) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, user.password_hash); // Changed from 'password' to 'password_hash'
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = createToken({ userId: user.user_id, role: user.role });
  delete user.password_hash; // Don't return the password hash

  return { user, token };
};

module.exports = {
  registerUser,
  loginUser,
};
