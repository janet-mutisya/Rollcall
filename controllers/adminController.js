const User = require('../models/User');

//  Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // don't expose password
    res.json(users);
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//  Get users waiting for admin approval
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ approved: false }).select('-password');
    res.json(pendingUsers);
  } catch (err) {
    console.error('Get pending users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//  Approve a user (admin action)
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { approved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User approved successfully', user });
  } catch (err) {
    console.error('Approve user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Stats for admin dashboard
exports.getApprovalStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const approved = await User.countDocuments({ approved: true });
    const pending = await User.countDocuments({ approved: false });

    res.json({ total, approved, pending });
  } catch (err) {
    console.error('Get approval stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
