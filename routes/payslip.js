
const express = require("express");
const router = express.Router();
const payslipController = require("../controllers/payslipController");
const protect = require("../middleware/protect");
const requireRole = require("../middleware/requireRole");
const multer = require("multer");

// Memory storage (swap with S3/multer-s3 if needed)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =============== STAFF ===============

// Staff: list own payslips (with filters)
router.get("/my", protect, payslipController.getMyPayslips);

// Staff: notifications
router.get("/my/notifications", protect, payslipController.getMyPayslipNotifications);

// Staff: download own payslips (format = pdf|excel|csv)
router.get("/my/download", protect, payslipController.downloadMyPayslips);

// =============== ADMIN ===============

// Admin: list all payslips (filters + pagination)
router.get("/", protect, requireRole("admin"), payslipController.getAllPayslips);

// Admin: create/release a payslip (optional file upload)
router.post("/", protect, requireRole("admin"), upload.single("file"), payslipController.createPayslip);

// Admin: export payslips as CSV
router.get("/export/csv", protect, requireRole("admin"), payslipController.exportPayslipsCSV);

// Admin: export payslips as Excel
router.get("/export/excel", protect, requireRole("admin"), payslipController.exportPayslipsExcel);

// Admin: stats
router.get("/stats", protect, requireRole("admin"), payslipController.getPayslipStats);

module.exports = router;
