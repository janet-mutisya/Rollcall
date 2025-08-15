const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const protect = require('../middleware/protect'); 
const requireRole = require('../middleware/requireRole'); 

// Only admin and manager can create, update, or delete roles
router.post('/roles', protect, requireRole('admin', 'manager'), roleController.createRole);
router.put('/roles/:id', protect, requireRole('admin', 'manager'), roleController.updateRole);
router.delete('/roles/:id', protect, requireRole('admin', 'manager'), roleController.deleteRole);

// Everyone logged in can view roles
router.get('/roles', protect, roleController.getRoles);
router.get('/roles/:id', protect, roleController.getRoleById);

module.exports = router;
