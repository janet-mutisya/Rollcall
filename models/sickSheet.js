const mongoose = require('mongoose');

const sickSheetSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
    reason: { 
      type: String, 
      required: true 
    },
    attachmentUrl: { 
      type: String 
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('SickSheet', sickSheetSchema);