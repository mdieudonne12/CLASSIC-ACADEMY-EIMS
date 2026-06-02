// Classic Academy EIMS - Department Routes
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Protected routes (available for all authenticated staff)
router.get('/', authenticateToken, departmentController.getDepartments);
router.get('/:id', authenticateToken, departmentController.getDepartmentById);

// HR/Admin routes
router.post('/', authenticateToken, authorizeRoles('Admin', 'Manager'), departmentController.createDepartment);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), departmentController.updateDepartment);
router.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), departmentController.deleteDepartment);

module.exports = router;
