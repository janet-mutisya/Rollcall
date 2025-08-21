const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const protect = require("../middleware/protect");
const requireRole = require("../middleware/requireRole");
const multer = require("multer");

// Memory storage since we upload directly to S3
const storage = multer.memoryStorage();
const upload = multer({ storage });

//
// Staff routes
//

// Staff submits an emergency (with optional file)
router.post(
  '/submit',
  protect,
  upload.single("file"),
  emergencyController.submitEmergency
);

// Staff views their own emergencies
router.get(
  '/my-emergencies',
  protect,
  emergencyController.getMyEmergencies
);

// Staff views their emergency notifications
router.get(
  '/my-notifications',
  protect,
  async (req, res) => {
    try {
      const Notification = require('../models/Notification');
      const notifications = await Notification.find({ 
        user: req.user.id, 
        type: 'emergency' 
      }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: notifications });
    } catch (err) {
      console.error("Error fetching emergency notifications:", err);
      res.status(500).json({ success: false, message: "Server error fetching notifications" });
    }
  }
);

//
// Admin routes
//

// Admin views all emergencies (with filters, pagination, etc.)
router.get(
  '/',
  protect,
  requireRole("admin"),
  emergencyController.getAllEmergencies
);

// Admin updates emergency status (approve/reject/resolve)
router.put(
  '/:id/status',
  protect,
  requireRole("admin"),
  emergencyController.updateEmergencyStatus
);

// Delete an emergency (owner or admin)
router.delete(
  '/:id',
  protect,
  emergencyController.deleteEmergency
);

// Emergency stats (for dashboards, admin only)
router.get(
  '/stats',
  protect,
  requireRole("admin"),
  emergencyController.getEmergencyStats
);

// Generate signed URL for file download
router.get(
  '/:id/file',
  protect,
  emergencyController.getSignedUrl
);

// Admin can trigger a notification manually (testing / resend)
router.post(
  '/:id/notify',
  protect,
  requireRole("admin"),
  async (req, res) => {
    try {
      const Emergency = require('../models/emergency');
      const Notification = require('../models/Notification');

      const emergency = await Emergency.findById(req.params.id).populate("user", "name");
      if (!emergency) {
        return res.status(404).json({ success: false, message: "Emergency not found" });
      }

      await Notification.create({
        user: emergency.user._id,
        type: 'emergency',
        title: 'Emergency Notification',
        message: `Reminder regarding your emergency report.`,
        link: `/emergencies/${emergency._id}`
      });

      res.status(200).json({ success: true, message: "Notification sent" });
    } catch (err) {
      console.error("Error sending notification:", err);
      res.status(500).json({ success: false, message: "Server error sending notification" });
    }
  }
);

module.exports = router;
