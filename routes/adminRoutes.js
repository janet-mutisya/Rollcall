const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const requireRole = require('../middleware/requireRole');
const { getAllUsers } = require('../controllers/adminController');

router.get('/users', protect, requireRole('admin'), getAllUsers);

module.exports = router;

