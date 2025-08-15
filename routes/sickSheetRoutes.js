const express = require('express');
const router = express.Router();
const sickSheetController = require('../controllers/sickSheetcontroller');
const { protect, authorize } = require('../middleware/auth');

// Staff routes
router.post('/', 
  protect, 
  sickSheetController.uploadSickSheet, 
  sickSheetController.submitSickSheet
);

router.get('/me', protect, sickSheetController.getMySickSheets);

// Admin routes
router.get('/', protect, authorize('admin'), sickSheetController.getAllSickSheets);
router.delete('/:id', protect, authorize('admin'), sickSheetController.deleteSickSheet);
router.put('/:id', protect, authorize('admin'), sickSheetController.updateSickSheetStatus);
router.get('/stats', protect, authorize('admin'), sickSheetController.getSickSheetStats);

module.exports = router;