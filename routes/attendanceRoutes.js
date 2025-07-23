const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const protect = require('../middleware/protect');

// Mark attendance
router.post('/mark', protect, attendanceController.markAttendance);

// Mark checkout
router.post('/checkout', protect, attendanceController.markCheckout);

// Fetch my attendance records
router.get('/my', protect, attendanceController.getMyAttendance);

// Get all attendance records
router.get('/all', protect, attendanceController.getAllAttendance);

// Count attendance days
// routes/attendanceRoutes.js
router.get('/count', protect, attendanceController.countAttendanceDays);


module.exports = router;
