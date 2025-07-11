const express = require('express');
const router = express.Router();
const publicHolidayController = require('../controllers/publicHolidayController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Admin creates public holiday
router.post('/public-holidays', auth, admin, publicHolidayController.createPublicHoliday);

// Admin updates public holiday
router.put('/public-holidays/:id', auth, admin, publicHolidayController.updatePublicHoliday);

// Admin deletes public holiday
router.delete('/public-holidays/:id', auth, admin, publicHolidayController.deletePublicHoliday);

// Staff and admin view all public holidays
router.get('/public-holidays', auth, publicHolidayController.getAllPublicHolidays);

module.exports = router;
