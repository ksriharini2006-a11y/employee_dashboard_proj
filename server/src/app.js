// server/src/app.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.status(200).json({ success: true, message: 'OK' }));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error handler — must be registered last
app.use(errorHandler);

module.exports = app;
