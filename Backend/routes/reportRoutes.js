// Classic Academy EIMS - Reports and Analytics Routes
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Dashboard summary counters
router.get('/summary', authenticateToken, reportController.getDashboardSummary);

// Dashboard visual chart data
router.get('/charts', authenticateToken, reportController.getChartAnalytics);

module.exports = router;
