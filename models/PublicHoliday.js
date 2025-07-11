const mongoose = require('mongoose');

const publicHolidaySchema = new mongoose.Schema({
    Name: {type:String, required:true},
    isPaid: {type:Boolean,required:true},
    date: {type:Date, required:true},
},
{timestamps:true}
);
module.exports = mongoose.model('PublicHoliday', publicHolidaySchema);