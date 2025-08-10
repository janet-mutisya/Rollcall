
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staff: {type: mongoose.Schema.Types.ObjectId, ref: 'Staff',required: true },
  shift: {type: mongoose.Schema.Types.ObjectId,ref: 'Shift',required: true},
  date: {type: Date, required: true},
  checkInTime: {type: Date, required: true},
  checkOutTime: {type: Date },
  status: {type: String,enum: ['Present', 'Late', 'Absent', 'off'],default: 'Present'}
}, {timestamps: true});

module.exports = mongoose.model('Attendance', attendanceSchema);
