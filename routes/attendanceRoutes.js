const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/mark-attendance', attendanceController.markAttendance);
router.get('/my-attendance', attendanceController.getMyAttendance);
router.get('/all', attendanceController.getAllAttendance);

module.exports = router;
