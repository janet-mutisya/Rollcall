const mongoose = require('mongoose');
const Offday = require('../models/Offday');

// Staff requests offday
exports.requestOffday = async (req, res) => {
  try {
    const { date, reason } = req.body;

    const offday = await Offday.create({
      staff: req.user.id,
      date,
      reason
    });

    res.status(201).json({
      success: true,
      message: 'Offday requested successfully',
      data: offday
    });
  } catch (err) {
    console.error('Error requesting offday:', err);
    res.status(500).json({ success: false, message: 'Server error requesting offday', error: err.message });
  }
};

// Admin approves/rejects offday
exports.updateOffdayStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const offdayId = req.params.id;

    const offday = await Offday.findById(offdayId);
    if (!offday) {
      return res.status(404).json({ success: false, message: 'Offday not found' });
    }

    offday.status = status;
    offday.approvedBy = req.user.id;

    await offday.save();

    res.status(200).json({
      success: true,
      message: `Offday ${status.toLowerCase()}`,
      data: offday
    });
  } catch (err) {
    console.error('Error updating offday status:', err);
    res.status(500).json({ success: false, message: 'Server error updating offday', error: err.message });
  }
};

// Staff views own offdays
exports.getMyOffdays = async (req, res) => {
  try {
    const offdays = await Offday.find({ staff: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: offdays.length,
      data: offdays
    });
  } catch (err) {
    console.error('Error fetching offdays:', err);
    res.status(500).json({ success: false, message: 'Server error fetching offdays', error: err.message });
  }
};

// Admin views all offdays
exports.getAllOffdays = async (req, res) => {
  try {
    const offdays = await Offday.find()
      .populate('staff', 'name serviceNumber')
      .populate('approvedBy', 'name serviceNumber')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: offdays.length,
      data: offdays
    });
  } catch (err) {
    console.error('Error fetching all offdays:', err);
    res.status(500).json({ success: false, message: 'Server error fetching all offdays', error: err.message });
  }
};

// find off by service number
exports.getOffdaysByServiceNumber = async (req, res) => {
    try {
      const user = await User.findOne({ serviceNumber: req.params.serviceNumber });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const offdays = await Offday.find({ staff: user._id });
  
      res.status(200).json({
        success: true,
        count: offdays.length,
        data: offdays
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
// cancel off day
exports.cancelOffday = async (req, res) => {
    try {
      const offday = await Offday.findById(req.params.id);
      if (!offday) {
        return res.status(404).json({ success: false, message: 'Offday not found' });
      }
  
      offday.status = 'Cancelled';
      offday.cancelled = true;
      offday.isDebt = true;
      offday.cancellationReason = req.body.cancellationReason || 'No reason provided';
      offday.cancelledBy = req.user.id;
  
      await offday.save();
  
      res.status(200).json({
        success: true,
        message: 'Offday cancelled and marked as debt to company',
        data: offday
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

// number of offdays cancelled
  exports.getOffdayDebts = async (req, res) => {
    try {
      const debts = await Offday.find({ staff: req.user.id, isDebt: true });
  
      res.status(200).json({
        success: true,
        count: debts.length,
        data: debts
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  
