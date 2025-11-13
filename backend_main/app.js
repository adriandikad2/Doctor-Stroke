require('dotenv').config();
const express = require('express');
const authRoutes = require('./src/api/auth.routes.js');
const patientRoutes = require('./src/api/patient.routes.js');
const appointmentRoutes = require('./src/api/appointment.routes.js');
const logRoutes = require('./src/api/log.routes.js');
const medicationRoutes = require('./src/api/medication.routes.js');

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.send('Server is running!'));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/medications', medicationRoutes);

module.exports = app;
