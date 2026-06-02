// Classic Academy EIMS - Employee Routes
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Protected paths for all staff
router.get('/', authenticateToken, employeeController.getEmployees);
router.get('/:id', authenticateToken, employeeController.getEmployeeById);

// Admin/Manager routes for edits
router.post('/', authenticateToken, authorizeRoles('Admin', 'Manager'), employeeController.createEmployee);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), employeeController.updateEmployee);
router.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), employeeController.deleteEmployee);

// Bulk upload route (HR/Admin)
router.post('/bulk', authenticateToken, authorizeRoles('Admin', 'Manager'), employeeController.bulkUploadEmployees);

module.exports = router;
