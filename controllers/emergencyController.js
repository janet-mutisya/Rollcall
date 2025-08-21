const Emergency = require('../models/emergency');
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

const EMERGENCY_LIMITS = {
  MONTHLY_LIMIT: 2,
  YEARLY_LIMIT: 10,
};

// --- S3 Helpers ---
const uploadToS3 = async (file, folder = 'emergencies') => {
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
const checkEmergencyLimits = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyCount = await Emergency.countDocuments({
    user: userId,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  if (monthlyCount >= EMERGENCY_LIMITS.MONTHLY_LIMIT) {
    return { canSubmit: false, message: `Monthly limit exceeded (${EMERGENCY_LIMITS.MONTHLY_LIMIT}).` };
  }

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  const yearlyCount = await Emergency.countDocuments({
    user: userId,
    createdAt: { $gte: startOfYear, $lte: endOfYear },
  });

  if (yearlyCount >= EMERGENCY_LIMITS.YEARLY_LIMIT) {
    return { canSubmit: false, message: `Yearly limit exceeded (${EMERGENCY_LIMITS.YEARLY_LIMIT}).` };
  }

  return {
    canSubmit: true,
    message: 'You can submit an emergency request',
    remainingMonthly: EMERGENCY_LIMITS.MONTHLY_LIMIT - monthlyCount,
    remainingYearly: EMERGENCY_LIMITS.YEARLY_LIMIT - yearlyCount,
  };
};

// --- Controllers ---
const submitEmergency = async (req, res) => {
  try {
    const { reason } = req.body;
    const limitCheck = await checkEmergencyLimits(req.user.id);

    if (!limitCheck.canSubmit) {
      return res.status(400).json({ success: false, message: limitCheck.message });
    }

    let attachmentUrl = null, attachmentKey = null;
    if (req.file) {
      const uploadResult = await uploadToS3(req.file);
      attachmentUrl = uploadResult.url;
      attachmentKey = uploadResult.key;
    }

    const emergency = await Emergency.create({
      user: req.user.id,
      reason,
      attachmentUrl,
      attachmentKey,
    });

    await emergency.populate('user', 'name serviceNumber');

    // 🔔 Notify admins
    const admins = await User.find({ role: 'admin' });
    await Notification.insertMany(
      admins.map(admin => ({
        user: admin._id,
        type: 'emergency',
        title: 'New Emergency Request Submitted',
        message: `${emergency.user.name} submitted an emergency request.`,
        link: `/emergencies/${emergency._id}`
      }))
    );

    res.status(201).json({
      success: true,
      message: 'Emergency request submitted successfully',
      data: emergency,
      limits: {
        remainingMonthly: (limitCheck.remainingMonthly || 1) - 1,
        remainingYearly: (limitCheck.remainingYearly || 1) - 1,
      },
    });
  } catch (err) {
    console.error('Error submitting emergency:', err);
    if (req.file?.key) await deleteFromS3(req.file.key);
    res.status(500).json({ success: false, message: 'Server error submitting emergency', error: err.message });
  }
};

const getMyEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ user: req.user.id })
      .populate('user', 'name serviceNumber')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    const limitCheck = await checkEmergencyLimits(req.user.id);

    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies,
      limits: {
        ...limitCheck,
        monthlyLimit: EMERGENCY_LIMITS.MONTHLY_LIMIT,
        yearlyLimit: EMERGENCY_LIMITS.YEARLY_LIMIT,
      },
    });
  } catch (err) {
    console.error('Error fetching my emergencies:', err);
    res.status(500).json({ success: false, message: 'Server error fetching emergencies', error: err.message });
  }
};

const getAllEmergencies = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (userId) query.user = userId;

    const emergencies = await Emergency.find(query)
      .populate('user', 'name serviceNumber email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Emergency.countDocuments(query);

    res.status(200).json({
      success: true,
      count: emergencies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: emergencies,
    });
  } catch (err) {
    console.error('Error fetching emergencies:', err);
    res.status(500).json({ success: false, message: 'Server error fetching emergencies', error: err.message });
  }
};

const deleteEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id).populate("user", "name serviceNumber email");

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    if (emergency.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this emergency' });
    }

    if (emergency.attachmentKey) {
      await deleteFromS3(emergency.attachmentKey);
    }

    await emergency.deleteOne();

    // 🔔 Notify employee of deletion
    await Notification.create({
      user: emergency.user._id,
      type: 'emergency',
      title: 'Emergency Request Deleted',
      message: `Your emergency request was deleted by ${req.user.name || 'an admin'}.`,
    });

    res.status(200).json({ success: true, message: 'Emergency deleted successfully' });
  } catch (err) {
    console.error('Error deleting emergency:', err);
    res.status(500).json({ success: false, message: 'Server error deleting emergency', error: err.message });
  }
};

const updateEmergencyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const emergency = await Emergency.findById(req.params.id).populate("user", "name serviceNumber email");

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    emergency.status = status;
    emergency.reviewedBy = req.user.id;
    await emergency.save();

    // 🔔 Notify employee
    await Notification.create({
      user: emergency.user._id,
      type: 'emergency',
      title: `Emergency ${status}`,
      message: `Your emergency request has been ${status} by ${req.user.name || 'an admin'}.`,
      link: `/emergencies/${emergency._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Emergency status updated',
      data: emergency,
    });
  } catch (err) {
    console.error('Error updating emergency status:', err);
    res.status(500).json({ success: false, message: 'Server error updating status', error: err.message });
  }
};

const getEmergencyStats = async (req, res) => {
  try {
    const total = await Emergency.countDocuments();
    const pending = await Emergency.countDocuments({ status: 'pending' });
    const approved = await Emergency.countDocuments({ status: 'approved' });
    const rejected = await Emergency.countDocuments({ status: 'rejected' });

    res.status(200).json({
      success: true,
      stats: { total, pending, approved, rejected },
    });
  } catch (err) {
    console.error('Error fetching emergency stats:', err);
    res.status(500).json({ success: false, message: 'Server error fetching stats', error: err.message });
  }
};

const getUserLimits = async (req, res) => {
  try {
    const limitCheck = await checkEmergencyLimits(req.user.id);
    res.status(200).json({
      success: true,
      limits: {
        ...limitCheck,
        monthlyLimit: EMERGENCY_LIMITS.MONTHLY_LIMIT,
        yearlyLimit: EMERGENCY_LIMITS.YEARLY_LIMIT,
      },
    });
  } catch (err) {
    console.error('Error fetching user limits:', err);
    res.status(500).json({ success: false, message: 'Server error fetching limits', error: err.message });
  }
};

const getSignedUrl = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    if (emergency.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this file' });
    }

    if (!emergency.attachmentKey) {
      return res.status(400).json({ success: false, message: 'No attachment found' });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: emergency.attachmentKey,
    });

    const url = await getS3SignedUrl(s3Client, command, { expiresIn: 60 * 5 });

    res.status(200).json({ success: true, url });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    res.status(500).json({ success: false, message: 'Server error generating signed URL', error: err.message });
  }
};

module.exports = {
  submitEmergency,
  getMyEmergencies,
  getAllEmergencies,
  deleteEmergency,
  updateEmergencyStatus,
  getEmergencyStats,
  getUserLimits,
  getSignedUrl
};
