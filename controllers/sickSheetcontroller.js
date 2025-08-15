const SickSheet = require('../models/sickSheet');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sick-sheets/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'sick-sheet-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Word documents are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Export the upload middleware
exports.uploadSickSheet = upload.single('attachment');

// Staff submits a sick sheet
exports.submitSickSheet = async (req, res) => {
  try {
    const { reason } = req.body;
    
    // Get attachment URL from uploaded file
    const attachmentUrl = req.file ? `/uploads/sick-sheets/${req.file.filename}` : null;

    const sickSheet = await SickSheet.create({
      user: req.user.id,
      reason,
      attachmentUrl
    });

    await sickSheet.populate('user', 'name serviceNumber');

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
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const sheets = await SickSheet.find(query)
      .populate('user', 'name serviceNumber email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SickSheet.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sheets.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
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

// Staff views their own sick sheets
exports.getMySickSheets = async (req, res) => {
  try {
    const sheets = await SickSheet.find({ user: req.user.id })
      .populate('user', 'name serviceNumber')
      .populate('reviewedBy', 'name')
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

    // Delete the file if it exists
    if (sheet.attachmentUrl) {
      const fs = require('fs');
      const filePath = path.join(__dirname, '..', sheet.attachmentUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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

// Admin updates sick sheet status
exports.updateSickSheetStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    const sheet = await SickSheet.findById(req.params.id);

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Sick sheet not found'
      });
    }

    sheet.status = status;
    sheet.adminNotes = adminNotes || sheet.adminNotes;
    sheet.reviewedAt = new Date();
    sheet.reviewedBy = req.user.id;

    await sheet.save();
    await sheet.populate([
      { path: 'user', select: 'name serviceNumber email' },
      { path: 'reviewedBy', select: 'name' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Sick sheet updated successfully',
      data: sheet
    });
  } catch (err) {
    console.error('Error updating sick sheet:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating sick sheet',
      error: err.message
    });
  }
};

// Get sick sheet statistics (for admin dashboard)
exports.getSickSheetStats = async (req, res) => {
  try {
    const totalSheets = await SickSheet.countDocuments();
    const pendingSheets = await SickSheet.countDocuments({ status: 'pending' });
    const approvedSheets = await SickSheet.countDocuments({ status: 'approved' });
    const rejectedSheets = await SickSheet.countDocuments({ status: 'rejected' });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSheets = await SickSheet.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get monthly stats for chart
    const monthlyStats = await SickSheet.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalSheets,
        pending: pendingSheets,
        approved: approvedSheets,
        rejected: rejectedSheets,
        recent: recentSheets,
        monthly: monthlyStats
      }
    });
  } catch (err) {
    console.error('Error fetching sick sheet stats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sick sheet stats',
      error: err.message
    });
  }
};