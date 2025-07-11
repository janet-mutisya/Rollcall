const Dispatch = require('../models/dispatch');
const User = require('../models/User');

// Create dispatch record
exports.createDispatch = async (req, res) => {
  try {
    const { serviceNumber, actionType, details } = req.body;

    // Find staff by service number
    const staff = await User.findOne({ serviceNumber });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const dispatch = await Dispatch.create({
      staff: staff._id,
      actionType,
      details,
      issuedBy: req.user.id // admin issuing dispatch
    });

    res.status(201).json({
      success: true,
      message: 'Dispatch created successfully',
      data: dispatch
    });
  } catch (err) {
    console.error('Error creating dispatch:', err);
    res.status(500).json({ success: false, message: 'Server error creating dispatch', error: err.message });
  }
};

// Get all dispatch records (admin)
exports.getAllDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.find()
      .populate('staff', 'name serviceNumber')
      .populate('issuedBy', 'name serviceNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dispatches.length,
      data: dispatches
    });
  } catch (err) {
    console.error('Error fetching dispatches:', err);
    res.status(500).json({ success: false, message: 'Server error fetching dispatches', error: err.message });
  }
};

// Get my dispatch records (staff)
exports.getMyDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.find({ staff: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dispatches.length,
      data: dispatches
    });
  } catch (err) {
    console.error('Error fetching my dispatches:', err);
    res.status(500).json({ success: false, message: 'Server error fetching dispatches', error: err.message });
  }
};
