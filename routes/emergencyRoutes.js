const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const auth = require('../middleware/auth');
const admin = require('../middleware/protect');

// Staff requests emergency absence
router.post('/emergencies', auth, emergencyController.requestEmergency);

// Staff views their own emergencies
router.get('/emergencies/mine', auth, emergencyController.getMyEmergencies);

// Admin views all emergencies
router.get('/emergencies', auth, admin, emergencyController.getAllEmergencies);

// Admin approves/rejects emergency
router.put('/emergencies/:id', auth, admin, emergencyController.updateEmergencyStatus);

module.exports = router;
