require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./src/api/auth.routes.js');
const patientRoutes = require('./src/api/patient.routes.js');
const appointmentRoutes = require('./src/api/appointment.routes.js');
const logRoutes = require('./src/api/log.routes.js');
const medicationRoutes = require('./src/api/medication.routes.js');
const prescriptionRoutes = require('./src/api/prescription.routes.js');
const progressRoutes = require('./src/api/progress.routes.js');
const nutritionRoutes = require('./src/api/nutrition.routes.js');

const app = express();

// CORS - Allow frontend origins
app.use(cors({
  origin: [
    'http://localhost:5173',      // Web portal
    'http://localhost:8082',      // Normal site
    'http://localhost:19006',     // Expo web
    'http://192.168.1.0/24'       // Your local network for mobile
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ 
  status: 'running',
  message: 'Doctor Stroke Backend API',
  timestamp: new Date().toISOString(),
  database: 'connected'
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/nutrition', nutritionRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
