// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // admin or employee
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['emergency', 'sickSheet', 'general'], default: 'general' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
