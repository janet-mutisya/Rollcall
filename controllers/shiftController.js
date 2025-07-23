const Shift = require('../models/Shift');
const User = require('../models/User');

// Create a new shift
exports.createShift = async (req, res) => {
  try {
    const { ServiceNumber, site, shiftDate, shiftType } = req.body;

    // Validate staff existence
    const staff = await User.findOne({ serviceNumber: ServiceNumber });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    // Create shift
    const shift = await Shift.create({
      staff: staff._id,
      site,
      shiftDate,
      shiftType
    });

    res.status(201).json({
      success: true,
      message: 'Shift created successfully',
      data: shift
    });
  } catch (err) {
    console.error('Error creating shift:', err);
    res.status(500).json({
      success: false,
      message: 'Server error creating shift',
      error: err.message
    });
  }
};

// Get all shifts
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate('staff', 'name serviceNumber')
      .sort({ shiftDate: -1 });

    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts
    });
  } catch (err) {
    console.error('Error fetching shifts:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching shifts',
      error: err.message
    });
  }
};

// Get a single shift by ID
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('staff', 'name serviceNumber');

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    res.status(200).json({
      success: true,
      data: shift
    });
  } catch (err) {
    console.error('Error fetching shift by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching shift by ID',
      error: err.message
    });
  }
};
