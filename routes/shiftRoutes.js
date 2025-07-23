const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const auth = require('../middleware/auth'); // Uncomment when auth middleware is ready
 const admin = require('../middleware/protect'); // Uncomment when admin middleware is ready

// Create a new shift (admin only ideally)
router.post('/shifts', shiftController.createShift);

// Get all shifts
router.get('/shifts', shiftController.getAllShifts);

// Get a single shift by id
router.get('/shifts/:id', shiftController.getShiftById);

module.exports = router;
