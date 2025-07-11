const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup route
router.post('/auth/signup', authController.signup);

// Login route
router.post('/auth/login', authController.login);

module.exports = router;
