const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const SickSheet = require('../models/sickSheet');

// get route
router.get('/', async (req, res) => {
    try {
      const sheets = await SickSheet.find()
        .populate('user', 'name email'); // populates user name and email only
  
      res.json({
        success: true,
        data: sheets.map(sheet => ({
          _id: sheet._id,
          user: sheet.user,
          reason: sheet.reason,
          attachmentUrl: sheet.attachmentUrl, // shows uploaded file URL
          createdAt: sheet.createdAt,
          updatedAt: sheet.updatedAt
        }))
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server Error'
      });
    }
  });

// POST route to upload sick sheet and save in DB

router.post('/upload', upload.single('file'), async (req, res) => {
  const { user, reason } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const newSheet = new SickSheet({
      user,
      reason,
      attachmentUrl: req.file.location
    });

    await newSheet.save();

    res.json({
      success: true,
      message: 'Sick sheet uploaded and saved successfully',
      data: newSheet
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
