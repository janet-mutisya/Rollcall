const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionType: {
    type: String,
    enum: ['Offday Cancellation', 'Shift Change', 'Extra Duty'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  dateIssued: {
    type: Date,
    default: Date.now
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // references admin who issued
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Dispatch', dispatchSchema);
