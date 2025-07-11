const Shift = require('../models/Shift');

// Create a new shift
exports.createShift = async (req, res) => {
  try {
    const { site, shiftDate, shiftTime } = req.body;

    const shift = await Shift.create({
      site,
      shiftDate,
      shiftTime
    });

    res.status(201).json({ success: true, message: 'Shift created', data: shift });
  } catch (err) {
    console.error('Create shift error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all shifts
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find();

    res.status(200).json({ success: true, count: shifts.length, data: shifts });
  } catch (err) {
    console.error('Get shifts error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single shift by id
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.status(200).json({ success: true, data: shift });
  } catch (err) {
    console.error('Get shift by id error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
