const mongoose = require('mongoose');

const holidayAttendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
      },
      publicHoliday: {
        type: mongoose.Types.ObjectId,
        ref: 'PublicHoliday',
        required: true
      },
      isPaid: {
        type: Boolean,
        required: true
      }
    }, { timestamps: true }
);
module.export = mongoose.model('holidayAttendance', holidayAttendanceSchema )