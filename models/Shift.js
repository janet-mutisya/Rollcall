const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  site: { type: String, required: true },
  shiftDate: { type: Date, required: true },
  shiftType: { type: String, enum: ['Day', 'Night'], required: true },
  shiftTime: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Auto-set shiftTime based on shiftType before saving
shiftSchema.pre('save', function (next) {
  if (this.shiftType === 'Day') {
    this.shiftTime = '06:00-18:00';
  } else if (this.shiftType === 'Night') {
    this.shiftTime = '18:00-06:00';
  }
  next();
});

module.exports = mongoose.model('Shift', shiftSchema);

