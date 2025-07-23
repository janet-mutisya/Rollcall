const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    serviceNumber: {type: Number, required: true, unique: true},
    phoneNumber: { type: String, required: false },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
}, {timestamps:true}
);

// hashing password
userSchema.pre("save", async function( next) {
    if(!this.isModified("password"))
        return next();
    this.password = await bcrypt.hash(this.password, 10)
    next();
});
 //compare password
 userSchema.methods.matchPassword = function (enteredPassword){
   return bcrypt.compare(enteredPassword, this.password);
 };
 module.exports = mongoose.model('User', userSchema);