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
router.get('/count', protect, attendanceController.countAttendanceDays);

// check in
router.post('/check-in', protect, attendanceController.markAttendance); 

// check out
router.post('/check-out', protect, attendanceController.markCheckout); 

router.get('/my-shifts', protect, attendanceController.getMyShiftsWithAttendance);

module.exports = router;
