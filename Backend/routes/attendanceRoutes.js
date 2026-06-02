// Classic Academy EIMS - Attendance Routes
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Get daily attendance sheet (any authenticated staff)
router.get('/', authenticateToken, attendanceController.getDailyAttendance);

// Get attendance stats summary
router.get('/stats', authenticateToken, attendanceController.getAttendanceStats);

// Record daily logs (HR/Admin role)
router.post('/', authenticateToken, authorizeRoles('Admin', 'Manager'), attendanceController.recordAttendance);

module.exports = router;
