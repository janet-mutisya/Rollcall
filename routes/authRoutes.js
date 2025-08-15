const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/protect');
const { authLimiter } = require('../controllers/authController');

// Apply rate limiting to auth routes
router.use('/signup', authLimiter);
router.use('/login', authLimiter);

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/me', protect, authController.getProfile);
router.put('/me', protect, authController.updateProfile);
router.post('/logout', protect, authController.logout);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;