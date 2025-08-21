const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  staff: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  dateReported: { 
    type: Date, 
    default: Date.now 
  },
  emergencyDate: { 
    type: Date, 
    required: true 
  },
  reason: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending' 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  notes: { 
    type: String 
  },

  // 📎 Optional images (can be empty)
  images: [
    {
      url: { type: String },   // S3 URL or local path
      key: { type: String }    // S3 object key if needed for deletion
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);
