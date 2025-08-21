const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true }, // e.g. "2025-08"
  salary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  fileUrl: { type: String }, // optional uploaded file (PDF)
  releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["Pending", "Released"],
    default: "Pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Payslip", payslipSchema);
