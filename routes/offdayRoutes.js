const express = require('express');
const router = express.Router();
const offdayController = require('../controllers/offdayController');
const protect = require('../middleware/protect'); // auth middleware
const requireRole = require('../middleware/requireRole'); // role-based middleware

// Staff requests an offday (just need to be logged in)
router.post('/', protect, offdayController.requestOffday);

// Admin approves/rejects offday (must be admin)
router.put('/:id/status', protect, requireRole('admin'), offdayController.updateOffdayStatus);

// Cancel offday and mark as debt (admin only)
router.put('/:id/cancel', protect, requireRole('admin'), offdayController.cancelOffday);

// Get own offdays (user)
router.get('/my-offdays', protect, offdayController.getMyOffdays);

// Get offdays by service number (admin)
router.get('/serviceNumber/:serviceNumber', protect, requireRole('admin'), offdayController.getOffdaysByServiceNumber);

// Get offday debts (user)
router.get('/my/debts', protect, offdayController.getOffdayDebts);

// Admin edits offday (no delete)
router.put('/:id', protect, requireRole('admin'), offdayController.editOffday);

module.exports = router;
