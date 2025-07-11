const mongoose = require('mongoose');

const offdaySchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
  cancelled: { type: Boolean, default: false },
  cancellationReason: { type: String },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDebt: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Offday', offdaySchema);
