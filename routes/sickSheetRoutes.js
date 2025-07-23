const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/protect');
const sickSheetController = require('../controllers/sickSheetcontroller');

// Staff submits sick sheet
router.post('/sicksheets', auth, sickSheetController.submitSickSheet);

// Admin views all sick sheets
router.get('/sicksheets', auth, admin, sickSheetController.getAllSickSheets);

// Staff views own sick sheets
router.get('/sicksheets/mine', auth, sickSheetController.getMySickSheets);

module.exports = router;
