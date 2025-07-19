const mongoose = require('mongoose');

const holidayAttendanceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  holiday: {
    type: mongoose.Types.ObjectId,
    ref: 'PublicHoliday',
    required: true
  },
  dateWorked: {
    type: Date,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('HolidayAttendance', holidayAttendanceSchema);
