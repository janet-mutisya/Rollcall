// models/attendance.js
const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema({
  time: { type: Date, required: true, default: Date.now },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
});

const attendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment", // change if you use a different model name
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
    checkIns: [checkInSchema],
    checkOut: { type: Date },
    notes: { type: String },
    status: {
      type: String,
      enum: [
        "Present",
        "Absent - No Proof",
        "On Sick Leave",
        "On Emergency Leave",
        "Off Day",
        "Holiday - Worked",
      ],
      default: "Absent - No Proof",
    },
    doublePay: { type: Boolean, default: false },
    hasProof: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);

