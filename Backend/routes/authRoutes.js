// Classic Academy EIMS - Authentication Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public auth endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected profile endpoint
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
