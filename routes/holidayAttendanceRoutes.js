const express = require('express');
const router = express.Router();
const holidayAttendanceController = require('../controllers/holidayAttendanceController');
const auth = require('../middleware/auth');
const admin = require('../middleware/protect');

// Record staff holiday attendance (admin)
router.post('/holiday-attendance', auth, admin, holidayAttendanceController.markHolidayAttendance);

// Admin views all holiday attendance records
router.get('/holiday-attendance', auth, admin, holidayAttendanceController.getAllHolidayAttendance);

// Staff views own holiday attendance
router.get('/holiday-attendance/mine', auth, holidayAttendanceController.getMyHolidayAttendance);

module.exports = router;
