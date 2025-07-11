const express = require('express');
const router = express.Router();
const offdayController = require('../controllers/offdayController');
const protect = require('../middleware/auth');

// Staff requests an offday
router.post('/', protect, offdayController.requestOffday);

// Admin approves/rejects offday
router.put('/:id/status', protect, offdayController.updateOffdayStatus);

// Cancel offday and mark as a debt
router.put('/:id/cancel', protect, offdayController.cancelOffday);

// Get own offdays (using user ID from token)
router.get('/my-offdays', protect, offdayController.getMyOffdays);

// Get offdays by service number (admin searches staff records)
router.get('/serviceNumber/:serviceNumber', protect, offdayController.getOffdaysByServiceNumber);

// Get offday debts (own debts)
router.get('/my/debts', protect, offdayController.getOffdayDebts);

module.exports = router;
