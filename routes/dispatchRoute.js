const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');
const auth = require('../middleware/auth');
const admin = require('../middleware/protect');

// Admin creates dispatch
router.post('/dispatch', auth, admin, dispatchController.createDispatch);

// Admin views all dispatches
router.get('/dispatch', auth, admin, dispatchController.getAllDispatches);

// Staff views own dispatches
router.get('/dispatch/mine', auth, dispatchController.getMyDispatches);

module.exports = router;
