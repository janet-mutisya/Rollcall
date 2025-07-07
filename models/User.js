const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, require:true},
    role: {type:String, enum: ['employee', 'admin'], default:'employee'}

});

mongoose.exports = mongoose.model('User', userSchema)