const Emergency = require('../models/emergency');
const User = require('../models/User');

// Staff requests emergency absence
exports.requestEmergency = async (req, res) => {
  try {
    const { emergencyDate, returnDate, reason } = req.body;

    // Validate input
    if (!emergencyDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Emergency date and reason are required'
      });
    }

    // Ensure req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User info missing' });
    }

    const emergency = await Emergency.create({
      staff: req.user.id,
      emergencyDate,
      returnDate,
      reason
    });

    res.status(201).json({
      success: true,
      message: 'Emergency request submitted',
      data: emergency
    });
  } catch (err) {
    console.error('Error requesting emergency:', err);
    res.status(500).json({
      success: false,
      message: 'Server error requesting emergency',
      error: err.message
    });
  }
};

// Admin approves or rejects emergency
exports.updateEmergencyStatus = async (req, res) => {
  try {
    const { status, notes } = req.body; 
    const emergencyId = req.params.id;

    // Validate input
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (Approved or Rejected) is required'
      });
    }

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }

    // Ensure req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin info missing' });
    }

    emergency.status = status;
    emergency.notes = notes;
    emergency.approvedBy = req.user.id;

    await emergency.save();

    res.status(200).json({
      success: true,
      message: `Emergency ${status.toLowerCase()}`,
      data: emergency
    });
  } catch (err) {
    console.error('Error updating emergency status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating emergency status',
      error: err.message
    });
  }
};

// Staff views their emergency records
exports.getMyEmergencies = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User info missing' });
    }

    const emergencies = await Emergency.find({ staff: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (err) {
    console.error('Error fetching emergencies:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching emergencies',
      error: err.message
    });
  }
};

// Admin views all emergencies
exports.getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate('staff', 'name serviceNumber')
      .populate('approvedBy', 'name serviceNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (err) {
    console.error('Error fetching all emergencies:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching all emergencies',
      error: err.message
    });
  }
};
