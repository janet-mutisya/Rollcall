const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  serviceNumber: {type: Number, required: true, trim: true},
  site: { type: String, required: true },
  shiftDate: { type: Date, required: true },
  shiftType: { type: String, enum: ['Day', 'Night'], required: true },
  shiftTime: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Auto-set shiftTime based on shiftType
shiftSchema.pre('save', function (next) {
  this.shiftTime = this.shiftType === 'Day' ? '06:00-18:00' : '18:00-06:00';
  next();
});

module.exports = mongoose.model('Shift', shiftSchema);


