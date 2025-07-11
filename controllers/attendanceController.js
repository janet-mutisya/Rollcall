const Attendance = require('../models/attendance');
const Shift = require('../models/Shift');

exports.markAttendance = async (req, res) => {
  try {
    const { shiftId, checkInTime } = req.body;

    // Validate shift exists
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    // Prevent duplicate attendance for same shift + same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existing = await Attendance.findOne({
      staff: req.user.id,
      shift: shiftId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this shift today' });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      staff: req.user.id,
      shift: shiftId,
      date: today, // store today’s date
      status: 'Present',
      checkInTime
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ success: false, message: 'Server error marking attendance', error: err.message });
  }
};
// get attendance
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
  
  // get all attendances
  exports.getAllAttendance = async (req, res) => {
    try {
      // Get today's date range (midnight to midnight tomorrow)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
  
      // Pagination setup
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      // Get total count for pagination metadata
      const total = await Attendance.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      });
  
      // Fetch attendance records with population and sorting
      const attendance = await Attendance.find({
        createdAt: { $gte: today, $lt: tomorrow }
      })
        .populate('staff', 'name serviceNumber')
        .populate('shift', 'site shiftDate shiftTime')
        .sort({ 'shift.shiftTime': -1 })
        .skip(skip)
        .limit(limit);
  
      // Structured response with pagination metadata
      res.status(200).json({
        success: true,
        count: attendance.length,
        total,
        page,
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
  
  
  