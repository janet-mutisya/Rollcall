const User = require('../models/User');

// Admin views all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('roleId', 'name');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error fetching users', error: err.message });
  }
};

// Admin views single user
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('roleId', 'name');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, message: 'Server error fetching user', error: err.message });
  }
};

// Admin updates user role or info
exports.updateUser = async (req, res) => {
  try {
    const { name, phoneNumber, roleId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, roleId },
      { new: true }
    ).select('-password').populate('roleId', 'name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User updated', data: user });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Server error updating user', error: err.message });
  }
};

// User views own profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('roleId', 'name');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'Server error fetching profile', error: err.message });
  }
};

   // admin assign role
exports.assignMyRole = async (req, res) => {
  try {
    const { roleId } = req.body;

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    // Update user's role
    const user = await User.findByIdAndUpdate(req.user.id, { role: roleId }, { new: true }).populate('role');

    res.status(200).json({
      success: true,
      message: 'Role assigned successfully',
      data: user
    });

  } catch (err) {
    console.error('Error assigning role:', err);
    res.status(500).json({ success: false, message: 'Server error assigning role', error: err.message });
  }
};