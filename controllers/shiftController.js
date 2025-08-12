const Shift = require('../models/Shift');
const User = require('../models/User');

// Normalize date to YYYY-MM-DD
const normalizeDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Create Shift
exports.createShift = async (req, res) => {
  try {
    const { serviceNumber, site, shiftDate, shiftType } = req.body;

    if (!serviceNumber || !site || !shiftDate || !shiftType) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const shift = new Shift({
      serviceNumber,
      site,
      shiftDate: normalizeDate(shiftDate),
      shiftType,
    });

    await shift.save();
    res.status(201).json(shift);
  } catch (error) {
    console.error("Create Shift Error:", error);
    res.status(500).json({ message: 'Shift creation failed.', error });
  }
};

// Get All Shifts
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ shiftDate: -1 });

    const shiftsWithNames = await Promise.all(
      shifts.map(async (shift) => {
        const user = await User.findOne({ serviceNumber: shift.serviceNumber });

        return {
          ...shift.toObject(),
          staffName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        };
      })
    );

    res.status(200).json({
      success: true,
      count: shiftsWithNames.length,
      data: shiftsWithNames,
    });
  } catch (err) {
    console.error('Error fetching shifts:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching shifts',
      error: err.message,
    });
  }
};

// Get Shift by ID
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    const user = await User.findOne({ serviceNumber: shift.serviceNumber });

    res.status(200).json({
      success: true,
      data: {
        ...shift.toObject(),
        staffName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      },
    });
  } catch (err) {
    console.error('Error fetching shift by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching shift by ID',
      error: err.message,
    });
  }
};

// Update Shift
exports.updateShift = async (req, res) => {
  try {
    const { site, shiftDate, shiftType } = req.body;

    const updatedShift = await Shift.findByIdAndUpdate(
      req.params.id,
      {
        site,
        shiftDate: shiftDate ? normalizeDate(shiftDate) : undefined,
        shiftType,
      },
      { new: true, runValidators: true }
    );

    if (!updatedShift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Shift updated successfully',
      data: updatedShift,
    });
  } catch (err) {
    console.error('Error updating shift:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating shift',
      error: err.message,
    });
  }
};

// Delete Shift
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Shift deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting shift:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting shift',
      error: err.message,
    });
  }
};

// Filter Shifts by date, site, or serviceNumber
exports.filterShifts = async (req, res) => {
  try {
    const { date, site, serviceNumber } = req.query;

    const query = {};

    if (date) {
      const day = new Date(new Date(date).toDateString());
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      query.shiftDate = { $gte: day.toISOString().split("T")[0], $lt: nextDay.toISOString().split("T")[0] };
    }

    if (site) query.site = site;

    if (serviceNumber) query.serviceNumber = serviceNumber;

    const shifts = await Shift.find(query);

    const shiftsWithNames = await Promise.all(
      shifts.map(async (shift) => {
        const user = await User.findOne({ serviceNumber: shift.serviceNumber });

        return {
          ...shift.toObject(),
          staffName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        };
      })
    );

    res.status(200).json({
      success: true,
      count: shiftsWithNames.length,
      data: shiftsWithNames,
    });
  } catch (err) {
    console.error('Error filtering shifts:', err);
    res.status(500).json({
      success: false,
      message: 'Server error filtering shifts',
      error: err.message,
    });
  }
};

// Bulk create shifts for multiple service numbers
exports.bulkCreateShifts = async (req, res) => {
  try {
    const { serviceNumbers, site, shiftDate, shiftType } = req.body;

    if (!serviceNumbers || !Array.isArray(serviceNumbers) || serviceNumbers.length === 0) {
      return res.status(400).json({ message: 'serviceNumbers array is required' });
    }
    if (!site || !shiftDate || !shiftType) {
      return res.status(400).json({ message: 'site, shiftDate, and shiftType are required' });
    }

    const normalizedDate = normalizeDate(shiftDate);

    // Create shift objects for each serviceNumber
    const shiftsToCreate = serviceNumbers.map(sn => ({
      serviceNumber: sn,
      site,
      shiftDate: normalizedDate,
      shiftType,
    }));

    // Insert many shifts at once
    const createdShifts = await Shift.insertMany(shiftsToCreate);

    res.status(201).json({
      success: true,
      count: createdShifts.length,
      data: createdShifts,
    });
  } catch (error) {
    console.error('Bulk create shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk shift creation failed',
      error: error.message,
    });
  }
};
