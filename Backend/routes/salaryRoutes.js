// Classic Academy EIMS - Salary & Payroll Routes
const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Standard protected routes
router.get('/', authenticateToken, salaryController.getSalaryPayments);
router.get('/employee/:employeeId', authenticateToken, salaryController.getEmployeeSalaryHistory);
router.get('/payslip/:id', authenticateToken, salaryController.getPayslipById);

// Admin/HR routes to post salary
router.post('/', authenticateToken, authorizeRoles('Admin', 'Manager'), salaryController.recordSalaryPayment);

module.exports = router;
