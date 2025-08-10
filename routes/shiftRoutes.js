const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const auth = require('../middleware/auth'); 
const admin = require('../middleware/protect'); 

// Create a new shift (admin only)
router.post('/shifts', admin, shiftController.createShift);

// Get all shifts (any authenticated user)
router.get('/shifts', auth, shiftController.getAllShifts);

// Get a single shift by ID (any authenticated user)
router.get('/shifts/:id', auth, shiftController.getShiftById);

// Update shift (admin only)
router.put('/shifts/:id', admin, shiftController.updateShift);

// Delete shift (admin only)
router.delete('/shifts/:id', admin, shiftController.deleteShift);

// Filter shifts (admin only, or change to `auth` if needed)
router.get('/shifts/filter', admin, shiftController.filterShifts);

module.exports = router;
