const HolidayAttendance = require('../models/holidayAttendance');
const PublicHoliday = require('../models/PublicHoliday');
const User = require('../models/User');

exports.markHolidayAttendance = async (req, res) => {
  try {
    const { serviceNumber, holidayId, dateWorked } = req.body;

    // Find staff
    const staff = await User.findOne({ serviceNumber });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    // Find holiday
    const holiday = await PublicHoliday.findById(holidayId);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    // Check for duplicate record
    const existing = await HolidayAttendance.findOne({
      staff: staff._id,
      holiday: holidayId,
      dateWorked
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance for this holiday already recorded' });
    }

    //Create the record
    const record = await HolidayAttendance.create({
      staff: staff._id,
      holiday: holidayId,
      dateWorked
    });


    //populate staff and holiday details before returning
    const populatedRecord = await HolidayAttendance.findById(record._id)
      .populate('staff', 'name serviceNumber')
      .populate('holiday', 'name date');

    // Return the response
    res.status(201).json({
      success: true,
      message: 'Holiday attendance recorded',
      data: populatedRecord
    });
  } catch (err) {
    console.error('Error marking holiday attendance:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all holiday attendance records (admin)
exports.getAllHolidayAttendance = async (req, res) => {
  try {
    const records = await HolidayAttendance.find()
      .populate('staff', 'name serviceNumber')
      .populate('holiday', 'name date')
      .sort({ dateWorked: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error('Error fetching holiday attendance:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get my holiday attendance (staff)
exports.getMyHolidayAttendance = async (req, res) => {
  try {
    const records = await HolidayAttendance.find({ staff: req.user.id })
      .populate('holiday', 'name date')
      .sort({ dateWorked: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error('Error fetching my holiday attendance:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


