const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // don't expose password
    res.json(users);
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
