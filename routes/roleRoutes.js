const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const protect = require('../middleware/auth')
  
// post a role
router.post('/roles', protect, roleController.createRole);

// get al roles
router.get('/roles', protect, roleController.getRoles);

// get a role by id
router.get('/roles/:id', protect, roleController.getRoleById);

// update a role
router.put('/roles/:id', protect, roleController.updateRole);

// delete a role
router.delete('/roles/:id', protect, roleController.deleteRole);

module.exports = router;
