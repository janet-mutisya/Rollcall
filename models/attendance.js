const mongoose = require('mongoose')


const attendanceSchema =  new mongoose.Schema({
    user:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
       date: {type:Date, default:Date.now},
       clockIn: { type:String, required:true},
       clockOut: {type:String, required:true},
       status: {type: String, enum: ['present', 'absent', 'late', 'off'], default: 'present'},
       shiftId: {type: mongoose.Schema.Types.ObjectId,ref: 'Shift'},
       location: {type:String, required:true}
});

module.exports = mongoose.model('attendance', attendanceSchema )