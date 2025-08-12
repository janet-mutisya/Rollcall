const SickSheet = require('../models/sickSheet');
const User = require('../models/User');

// Staff submits a sick sheet
exports.submitSickSheet = async (req, res) => {
  try {
    const { reason, attachmentUrl } = req.body;

    const sickSheet = await SickSheet.create({
      user: req.user.id,
      reason,
      attachmentUrl
    });

    res.status(201).json({
      success: true,
      message: 'Sick sheet submitted successfully',
      data: sickSheet
    });
  } catch (err) {
    console.error('Error submitting sick sheet:', err);
    res.status(500).json({
      success: false,
      message: 'Server error submitting sick sheet',
      error: err.message
    });
  }
};

// Admin views all sick sheets
exports.getAllSickSheets = async (req, res) => {
  try {
    const sheets = await SickSheet.find()
      .populate('user', 'name serviceNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sheets.length,
      data: sheets
    });
  } catch (err) {
    console.error('Error fetching sick sheets:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sick sheets',
      error: err.message
    });
  }
};

// Staff views their sick sheets
exports.getMySickSheets = async (req, res) => {
  try {
    const sheets = await SickSheet.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sheets.length,
      data: sheets
    });
  } catch (err) {
    console.error('Error fetching my sick sheets:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sick sheets',
      error: err.message
    });
  }
};

// Admin deletes a sick sheet
exports.deleteSickSheet = async (req, res) => {
  try {
    const sheet = await SickSheet.findById(req.params.id);

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Sick sheet not found'
      });
    }

    await sheet.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sick sheet deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting sick sheet:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting sick sheet',
      error: err.message
    });
  }
};
