// routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const protect = require("../middleware/protect");
const requireRole = require("../middleware/requireRole"); // ✅ we use this instead of authorize

// ================= STAFF ROUTES =================

// Staff: check in (3 times a day with geolocation validation)
router.post("/checkin", protect, attendanceController.checkIn);

// Staff: check out (end of day)
router.post("/checkout", protect, attendanceController.checkOut);

// Staff: view own attendance records (with filters)
router.get("/my", protect, attendanceController.getMyAttendances);

// Staff: view attendance stats (monthly summary, etc.)
router.get("/my/stats", protect, attendanceController.getMyAttendanceStats);

// ================= ADMIN ROUTES =================

// Admin: get all attendances (with enriched status: holiday work, sick leave, offdays, proof, etc.)
router.get(
  "/",
  protect,
  requireRole("admin"), 
  attendanceController.getAllAttendances
);

// Admin: view attendance stats for dashboard
router.get(
  "/stats",
  protect,
  requireRole("admin"),
  attendanceController.getAttendanceStats
);

// Admin: export attendance data (CSV/Excel)
router.get(
  "/export/csv",
  protect,
  requireRole("admin"), 
  attendanceController.exportAttendanceCSV
);

router.get(
  "/export/excel",
  protect,
  requireRole("admin"), 
  attendanceController.exportAttendanceExcel
);

// Admin: manually mark/update attendance (in case corrections are needed)
router.put(
  "/:attendanceId",
  protect,
  requireRole("admin"), 
  attendanceController.updateAttendance
);

router.delete(
  "/:attendanceId",
  protect,
  requireRole("admin"), 
  attendanceController.deleteAttendance
);

module.exports = router;
