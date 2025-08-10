const mongoose = require('mongoose');

const sickSheetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  reason: { type: String, required: true },
  attachmentUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SickSheet', sickSheetSchema);

