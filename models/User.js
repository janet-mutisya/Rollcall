// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    roleRequestReason: { type: String },
    roleRequestedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// STATIC: Create user with default role
UserSchema.statics.createUserWithRole = async function (userData) {
    const Role = require('./Role');
    const defaultRole = await Role.findOne({ name: 'user' });

    if (!defaultRole) {
        throw new Error('Default user role not found. Please run role seeder first.');
    }

    const user = await this.create({
        ...userData,
        roleId: defaultRole._id,
        approvalStatus: 'pending'
    });

    return user;
};

// STATIC: Approve pending role change
UserSchema.statics.approveRoleChange = async function (userId, approvedBy) {
    const user = await this.findById(userId);
    if (!user || !user.requestedRoleId) {
        throw new Error('No pending role request found');
    }

    user.roleId = user.requestedRoleId;
    user.requestedRoleId = undefined;
    user.roleRequestReason = undefined;
    user.roleRequestedAt = undefined;
    user.approvedBy = approvedBy;
    user.approvedAt = new Date();
    user.approvalStatus = 'approved';

    return await user.save();
};

// INSTANCE: Request a role change
UserSchema.methods.requestRoleChange = async function (requestedRoleId, reason) {
    this.requestedRoleId = requestedRoleId;
    this.roleRequestReason = reason;
    this.roleRequestedAt = new Date();
    return await this.save();
};

module.exports = mongoose.model('User', UserSchema);
