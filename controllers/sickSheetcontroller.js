const SickSheet = require('../models/sickSheet');
const User = require('../models/User');
const Notification = require('../models/Notification');

const { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand 
} = require('@aws-sdk/client-s3');
const { getSignedUrl: getS3SignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const SICK_SHEET_LIMITS = {
  MONTHLY_LIMIT: 4,
  YEARLY_LIMIT: 30,
};

// --- S3 Helpers ---
const uploadToS3 = async (file, folder = 'sick-sheets') => {
  const key = `${folder}/${Date.now()}-${file.originalname}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ServerSideEncryption: 'AES256',
  });

  await s3Client.send(command);
  return {
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    key,
  };
};

const deleteFromS3 = async (key) => {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }));
  } catch (error) {
    console.error('S3 Delete failed:', error.message);
  }
};

// --- Limit Check ---
const checkSickSheetLimits = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyCount = await SickSheet.countDocuments({
    user: userId,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  if (monthlyCount >= SICK_SHEET_LIMITS.MONTHLY_LIMIT) {
    return { canSubmit: false, message: `Monthly limit exceeded (${SICK_SHEET_LIMITS.MONTHLY_LIMIT}).` };
  }

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  const yearlyCount = await SickSheet.countDocuments({
    user: userId,
    createdAt: { $gte: startOfYear, $lte: endOfYear },
  });

  if (yearlyCount >= SICK_SHEET_LIMITS.YEARLY_LIMIT) {
    return { canSubmit: false, message: `Yearly limit exceeded (${SICK_SHEET_LIMITS.YEARLY_LIMIT}).` };
  }

  return {
    canSubmit: true,
    message: 'You can submit a sick sheet',
    remainingMonthly: SICK_SHEET_LIMITS.MONTHLY_LIMIT - monthlyCount,
    remainingYearly: SICK_SHEET_LIMITS.YEARLY_LIMIT - yearlyCount,
  };
};

// --- Controllers ---
const submitSickSheet = async (req, res) => {
  try {
    const { reason } = req.body;
    const limitCheck = await checkSickSheetLimits(req.user.id);

    if (!limitCheck.canSubmit) {
      return res.status(400).json({ success: false, message: limitCheck.message });
    }

    let attachmentUrl = null, attachmentKey = null;
    if (req.file) {
      const uploadResult = await uploadToS3(req.file);
      attachmentUrl = uploadResult.url;
      attachmentKey = uploadResult.key;
    }

    const sickSheet = await SickSheet.create({
      user: req.user.id,
      reason,
      attachmentUrl,
      attachmentKey,
    });

    await sickSheet.populate('user', 'name serviceNumber');

    // 🔔 Notify admins
    const admins = await User.find({ role: 'admin' });
    await Notification.insertMany(
      admins.map(admin => ({
        user: admin._id,
        type: 'sickSheet',
        title: 'New Sick Sheet Submitted',
        message: `${sickSheet.user.name} submitted a sick sheet.`,
        link: `/sick-sheets/${sickSheet._id}`
      }))
    );

    res.status(201).json({
      success: true,
      message: 'Sick sheet submitted successfully',
      data: sickSheet,
      limits: {
        remainingMonthly: (limitCheck.remainingMonthly || 1) - 1,
        remainingYearly: (limitCheck.remainingYearly || 1) - 1,
      },
    });
  } catch (err) {
    console.error('Error submitting sick sheet:', err);
    if (req.file?.key) await deleteFromS3(req.file.key); // cleanup uploaded file if DB fails
    res.status(500).json({ success: false, message: 'Server error submitting sick sheet', error: err.message });
  }
};

const getMySickSheets = async (req, res) => {
  try {
    const sheets = await SickSheet.find({ user: req.user.id })
      .populate('user', 'name serviceNumber')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    const limitCheck = await checkSickSheetLimits(req.user.id);

    res.status(200).json({
      success: true,
      count: sheets.length,
      data: sheets,
      limits: {
        ...limitCheck,
        monthlyLimit: SICK_SHEET_LIMITS.MONTHLY_LIMIT,
        yearlyLimit: SICK_SHEET_LIMITS.YEARLY_LIMIT,
      },
    });
  } catch (err) {
    console.error('Error fetching my sick sheets:', err);
    res.status(500).json({ success: false, message: 'Server error fetching sick sheets', error: err.message });
  }
};

const getAllSickSheets = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (userId) query.user = userId;

    const sheets = await SickSheet.find(query)
      .populate('user', 'name serviceNumber email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await SickSheet.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sheets.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: sheets,
    });
  } catch (err) {
    console.error('Error fetching sick sheets:', err);
    res.status(500).json({ success: false, message: 'Server error fetching sick sheets', error: err.message });
  }
};

const deleteSickSheet = async (req, res) => {
  try {
    const sheet = await SickSheet.findById(req.params.id).populate("user", "name serviceNumber email");

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Sick sheet not found' });
    }

    if (sheet.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this sick sheet' });
    }

    if (sheet.attachmentKey) {
      await deleteFromS3(sheet.attachmentKey);
    }

    await sheet.deleteOne();

    // 🔔 Notify employee of deletion
    await Notification.create({
      user: sheet.user._id,
      type: 'sickSheet',
      title: 'Sick Sheet Deleted',
      message: `Your sick sheet was deleted by ${req.user.name || 'an admin'}.`,
    });

    res.status(200).json({ success: true, message: 'Sick sheet deleted successfully' });
  } catch (err) {
    console.error('Error deleting sick sheet:', err);
    res.status(500).json({ success: false, message: 'Server error deleting sick sheet', error: err.message });
  }
};

const updateSickSheetStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const sheet = await SickSheet.findById(req.params.id).populate("user", "name serviceNumber email");

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Sick sheet not found' });
    }

    sheet.status = status;
    sheet.reviewedBy = req.user.id;
    await sheet.save();

    // 🔔 Notify employee
    await Notification.create({
      user: sheet.user._id,
      type: 'sickSheet',
      title: `Sick Sheet ${status}`,
      message: `Your sick sheet has been ${status} by ${req.user.name || 'an admin'}.`,
      link: `/sick-sheets/${sheet._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Sick sheet status updated',
      data: sheet,
    });
  } catch (err) {
    console.error('Error updating sick sheet status:', err);
    res.status(500).json({ success: false, message: 'Server error updating status', error: err.message });
  }
};

const getSickSheetStats = async (req, res) => {
  try {
    const total = await SickSheet.countDocuments();
    const pending = await SickSheet.countDocuments({ status: 'pending' });
    const approved = await SickSheet.countDocuments({ status: 'approved' });
    const rejected = await SickSheet.countDocuments({ status: 'rejected' });

    res.status(200).json({
      success: true,
      stats: { total, pending, approved, rejected },
    });
  } catch (err) {
    console.error('Error fetching sick sheet stats:', err);
    res.status(500).json({ success: false, message: 'Server error fetching stats', error: err.message });
  }
};

const getUserLimits = async (req, res) => {
  try {
    const limitCheck = await checkSickSheetLimits(req.user.id);
    res.status(200).json({
      success: true,
      limits: {
        ...limitCheck,
        monthlyLimit: SICK_SHEET_LIMITS.MONTHLY_LIMIT,
        yearlyLimit: SICK_SHEET_LIMITS.YEARLY_LIMIT,
      },
    });
  } catch (err) {
    console.error('Error fetching user limits:', err);
    res.status(500).json({ success: false, message: 'Server error fetching limits', error: err.message });
  }
};

const getSignedUrl = async (req, res) => {
  try {
    const sheet = await SickSheet.findById(req.params.id);

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Sick sheet not found' });
    }

    if (sheet.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this file' });
    }

    if (!sheet.attachmentKey) {
      return res.status(400).json({ success: false, message: 'No attachment found' });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: sheet.attachmentKey,
    });

    const url = await getS3SignedUrl(s3Client, command, { expiresIn: 60 * 5 });

    res.status(200).json({ success: true, url });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    res.status(500).json({ success: false, message: 'Server error generating signed URL', error: err.message });
  }
};

module.exports = {
  submitSickSheet,
  getMySickSheets,
  getAllSickSheets,
  deleteSickSheet,
  updateSickSheetStatus,
  getSickSheetStats,
  getUserLimits,
  getSignedUrl
};
