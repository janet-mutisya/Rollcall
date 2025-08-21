const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  getAllUsers,
  getPendingUsers,
  approveUser,
  getApprovalStats
} = require('../controllers/adminController'); // ✅ import admin logic
const protect = require('../middleware/protect'); // ✅ auth middleware
const { authLimiter } = require('../controllers/authController');

// ============================
// Auth Routes
// ============================

// Apply rate limiting
router.use('/signup', authLimiter);
router.use('/login', authLimiter);

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected user routes
router.get('/me', protect, authController.getProfile);
router.put('/me', protect, authController.updateProfile);
router.post('/logout', protect, authController.logout);
router.put('/change-password', protect, authController.changePassword);

//ADMIN ROUTES
// Get ALL users (admin only)
router.get('/admin/users', protect, getAllUsers);

// Get users pending approval
router.get('/admin/pending-users', protect, getPendingUsers);

// Approve a user
router.post('/admin/approve-user/:userId', protect, approveUser);

// Get approval stats
router.get('/admin/approval-stats', protect, getApprovalStats);

module.exports = router;
