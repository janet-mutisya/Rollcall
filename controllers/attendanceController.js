const mongoose = require('mongoose');
const Attendance = require('../models/attendance');
const Shift = require('../models/Shift');

//Mark attendance for a shift
 
exports.markAttendance = async (req, res) => {
  try {
    const { shiftId, checkInTime } = req.body;

    // Validate shift exists
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    // Define today and tomorrow for uniqueness check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check for existing attendance today
    const existing = await Attendance.findOne({
      staff: req.user.id,
      shift: shiftId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this shift today'
      });
    }

    // Determine lateness
    const shiftStartTime = shift.shiftTime.split('-')[0];
    const shiftStart = new Date(`${shift.shiftDate}T${shiftStartTime}`);
    const checkIn = new Date(checkInTime);
    const isLate = checkIn > shiftStart;

    // Create attendance
    const attendance = await Attendance.create({
      staff: req.user.id,
      shift: shiftId,
      date: today,
      checkInTime: checkIn,
      status: isLate ? 'Late' : 'Present'
    });

    res.status(201).json({
      success: true,
      message: isLate ? 'Marked as Late' : 'Attendance marked successfully',
      data: attendance
    });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({
      success: false,
      message: 'Server error marking attendance',
      error: err.message
    });
  }
};

// Mark checkout for a shift
exports.markCheckout = async (req, res) => {
  try {
    const { shiftId } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const attendance = await Attendance.findOne({
      staff: req.user.id,
      shift: shiftId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance not found for today'
      });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (err) {
    console.error('Error marking checkout:', err);
    res.status(500).json({
      success: false,
      message: 'Server error marking checkout',
      error: err.message
    });
  }
};

// Get logged-in user's attendance
exports.getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ staff: req.user.id })
      .populate('shift', 'site shiftDate shiftTime shiftType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance',
      error: err.message
    });
  }
};


//Get all attendance records (admin usage)
 
exports.getAllAttendance = async (req, res) => {
  try {
    const {
      date,
      from,
      to,
      staffId,
      site,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      filter.createdAt = { $gte: d, $lt: next };
    } else if (from && to) {
      filter.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }

    if (staffId) {
      filter.staff = staffId;
    }

    if (site) {
      const shifts = await Shift.find({ site }).select('_id');
      filter.shift = { $in: shifts.map(s => s._id) };
    }

    const skip = (page - 1) * limit;
    const total = await Attendance.countDocuments(filter);

    const attendance = await Attendance.find(filter)
      .populate('staff', 'name serviceNumber')
      .populate('shift', 'site shiftDate shiftTime shiftType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      totalRecords: total,
      count: attendance.length,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: attendance
    });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance records',
      error: err.message
    });
  }
};

// Count unique attendance days for a staff member
 
exports.countAttendanceDays = async (req, res) => {
  try {
    const { staffId } = req.query;

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'staffId is required' });
    }

    const records = await Attendance.aggregate([
      { $match: { staff: mongoose.Types.ObjectId(staffId) } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          }
        }
      },
      { $count: "attendanceDays" }
    ]);

    const totalDays = records.length > 0 ? records[0].attendanceDays : 0;

    res.status(200).json({
      success: true,
      staffId,
      totalDays
    });
  } catch (err) {
    console.error('Error counting attendance days:', err);
    res.status(500).json({
      success: false,
      message: 'Server error counting attendance days',
      error: err.message
    });
  }
};
