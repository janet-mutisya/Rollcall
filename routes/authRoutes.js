const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/protect');

// Signup route
router.post('/signup', authController.signup);

// Login route
router.post('/login', authController.login);

// Get profile route
router.get('/me', protect, authController.getProfile);

// update profile
router.put('/me', protect, authController.updateProfile);

module.exports = router;
