const Emergency = require('../models/emergency');
const User = require('../models/User');

// Staff requests emergency absence
exports.requestEmergency = async (req, res) => {
  try {
    const { emergencyDate, returnDate, reason } = req.body;

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

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
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
