const express = require("express");
const router = express.Router();
const sickSheetController = require("../controllers/sickSheetcontroller");
const protect = require("../middleware/protect");
const requireRole = require("../middleware/requireRole");

// Staff submits a sick sheet
router.post("/submit", protect, sickSheetController.submitSickSheet);

// Staff views their own sick sheets
router.get("/my-sick-sheets", protect, sickSheetController.getMySickSheets);

// Staff checks their remaining limits
router.get("/limits", protect, sickSheetController.getUserLimits);

// Staff views a signed URL to their own attachment
router.get("/:id/signed-url", protect, sickSheetController.getSignedUrl);

// Admin gets all sick sheets (with filters, pagination)
router.get("/", protect, requireRole("admin"), sickSheetController.getAllSickSheets);

// Admin updates status (approve/reject)
router.put("/:id/status", protect, requireRole("admin"), sickSheetController.updateSickSheetStatus);

// Admin deletes a sick sheet
router.delete("/:id", protect, requireRole("admin"), sickSheetController.deleteSickSheet);

// Admin stats (for dashboard)
router.get("/stats/overview", protect, requireRole("admin"), sickSheetController.getSickSheetStats);

module.exports = router;
