const authService = require('../services/auth.service');

const handleRegister = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    res.status(200).json({ message: 'Login successful', user, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = {
  handleRegister,
  handleLogin,
};
