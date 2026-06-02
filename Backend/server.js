// Classic Academy EIMS - Express API Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDB, getDbType } = require('./config/db');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists for employee pictures
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Map Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/reports', reportRoutes);

// Health Check / Welcome route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Classic Academy EIMS API is healthy and running.',
    database: getDbType(),
    timestamp: new Date()
  });
});

// Serve Frontend build in production if needed (fallback)
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Classic Academy EIMS API. Access endpoints via /api.'
  });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error. Please contact the administrator.';

  return res.status(status).json({
    success: false,
    message: message,
    // Include stack trace only in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server after Database Connection
async function startServer() {
  try {
    // Establish connection to MySQL or fallback to SQLite
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`===========================================================`);
      console.log(` CLASSIC ACADEMY EIMS BACKEND RUNNING ON PORT: ${PORT}`);
      console.log(` ACTIVE DATABASE ENGINE: ${getDbType().toUpperCase()}`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(`===========================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting EIMS Backend Server:', error);
    process.exit(1);
  }
}

startServer();
