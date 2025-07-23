const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/protect');

// Admin views all users
router.get('/users', auth, admin, userController.getAllUsers);

// Admin views single user
router.get('/users/:id', auth, admin, userController.getUserById);

// Admin updates user
router.put('/users/:id', auth, admin, userController.updateUser);

// User views own profile
router.get('/me', auth, userController.getMyProfile);
  // admins assign roles
router.put('/me/assign-role', auth, userController.assignMyRole);

module.exports = router;
