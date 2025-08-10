const Attendance = require('../models/attendance');
const Shift = require('../models/Shift');
const mongoose = require('mongoose');

// Check-in (mark attendance)
exports.markAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const checkInTime = req.body.checkInTime ? new Date(req.body.checkInTime) : new Date();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Auto-detect today's shift
    const shift = await Shift.findOne({
    staff: userId,
    $expr: {
    $eq: [
      { $dateToString: { format: "%Y-%m-%d", date: "$shiftDate" } },
      new Date().toISOString().split('T')[0]
       ]
        }
   });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'No shift assigned for today' });
    }

    // Check if attendance already exists
    const existing = await Attendance.findOne({
      staff: userId,
      shift: shift._id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this shift today' });
    }

    // Determine lateness
    const shiftStartTime = shift.shiftTime.split('-')[0]; // e.g. "06:00"
    const shiftStart = new Date(`${shift.shiftDate.toISOString().split('T')[0]}T${shiftStartTime}`);
    const isLate = checkInTime > shiftStart;

    const attendance = await Attendance.create({
      staff: userId,
      shift: shift._id,
      date: today,
      checkInTime,
      status: isLate ? 'Late' : 'Present'
    });

    return res.status(201).json({
      success: true,
      message: isLate ? 'Marked as Late' : 'Attendance marked successfully',
      data: attendance
    });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Check-out
exports.markCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const checkOutTime = req.body.checkOutTime ? new Date(req.body.checkOutTime) : new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
     
    const shift = await Shift.findOne({
     staff: userId,
      $expr: {
      $eq: [
      { $dateToString: { format: "%Y-%m-%d", date: "$shiftDate" } },
      new Date().toISOString().split('T')[0]
    ]
      }
   });
   if (!shift) {
      return res.status(404).json({ success: false, message: 'No shift assigned for today' });
    }

    const attendance = await Attendance.findOne({
      staff: userId,
      shift: shift._id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No check-in record found to check out from' });
    }

    attendance.checkOutTime = checkOutTime;
    await attendance.save();

    return res.status(200).json({ success: true, message: 'Checked out successfully', data: attendance });
  } catch (err) {
    console.error('Error marking checkout:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get my attendance
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ staff: req.user.id }).populate('shift');
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    console.error('Error getting my attendance:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all attendance (admin)
exports.getAllAttendance = async (req, res) => {
  try {
    const { staff, date, status, site } = req.query;
    const filter = {};

    if (staff) filter.staff = staff;
    if (status) filter.status = status;

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }

    // Join shift to allow site filtering
    const records = await Attendance.find(filter).populate({
      path: 'shift',
      match: site ? { site } : {},
    }).populate('staff');

    const filtered = site ? records.filter(r => r.shift) : records;

    res.status(200).json({ success: true, data: filtered });
  } catch (err) {
    console.error('Error getting all attendance:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Count attendance days
exports.countAttendanceDays = async (req, res) => {
  try {
    const userId = req.user.id;

    const present = await Attendance.countDocuments({ staff: userId, status: 'Present' });
    const late = await Attendance.countDocuments({ staff: userId, status: 'Late' });
    const absent = await Attendance.countDocuments({staff: userId,status: 'absent'})
    res.status(200).json({
      success: true,
      data: {
        present,
        late,
        total: present + late,
      }
    });
  } catch (err) {
    console.error('Error counting attendance:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get my shifts with check-in info
exports.getMyShiftsWithAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const shifts = await Shift.find({ staff: userId })
      .sort({ shiftDate: -1 });

    const response = [];

    for (const shift of shifts) {
      const attendance = await Attendance.findOne({
        staff: userId,
        shift: shift._id
      });

      response.push({
        shift,
        attendance: attendance ? {
          checkInTime: attendance.checkInTime,
          status: attendance.status
        } : null
      });
    }

    res.status(200).json({ success: true, data: response });
  } catch (err) {
    console.error('Error getting my shifts with attendance:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
