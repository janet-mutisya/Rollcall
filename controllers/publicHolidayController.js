const PublicHoliday = require('../models/PublicHoliday');

// Admin creates public holiday
exports.createPublicHoliday = async (req, res) => {
  try {
    const { name, date } = req.body;

    // Check if date already exists
    const exists = await PublicHoliday.findOne({ date });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Public holiday already exists for this date' });
    }

    const holiday = await PublicHoliday.create({ name, date });

    res.status(201).json({
      success: true,
      message: 'Public holiday created successfully',
      data: holiday
    });
  } catch (err) {
    console.error('Error creating public holiday:', err);
    res.status(500).json({ success: false, message: 'Server error creating public holiday', error: err.message });
  }
};
// Update public holiday
exports.updatePublicHoliday = async (req, res) => {
    try {
      const { name, date } = req.body;
      const holiday = await PublicHoliday.findByIdAndUpdate(
        req.params.id,
        { name, date },
        { new: true }
      );
  
      if (!holiday) {
        return res.status(404).json({ success: false, message: 'Public holiday not found' });
      }
  
      res.status(200).json({
        success: true,
        message: 'Public holiday updated successfully',
        data: holiday
      });
    } catch (err) {
      console.error('Error updating public holiday:', err);
      res.status(500).json({ success: false, message: 'Server error updating public holiday', error: err.message });
    }
  };
  
  // Delete public holiday
  exports.deletePublicHoliday = async (req, res) => {
    try {
      const holiday = await PublicHoliday.findByIdAndDelete(req.params.id);
  
      if (!holiday) {
        return res.status(404).json({ success: false, message: 'Public holiday not found' });
      }
  
      res.status(200).json({
        success: true,
        message: 'Public holiday deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting public holiday:', err);
      res.status(500).json({ success: false, message: 'Server error deleting public holiday', error: err.message });
    }
  };
  
// Get all public holidays
exports.getAllPublicHolidays = async (req, res) => {
  try {
    const holidays = await PublicHoliday.find().sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: holidays.length,
      data: holidays
    });
  } catch (err) {
    console.error('Error fetching public holidays:', err);
    res.status(500).json({ success: false, message: 'Server error fetching public holidays', error: err.message });
  }
};
