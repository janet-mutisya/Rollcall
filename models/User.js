const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    serviceNumber: { type: String, required: true, unique: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    roleRequestReason: { type: String },
    roleRequestedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },

    // login attempt tracking
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number }
}, { timestamps: true });

/**
 * Password hashing before save
 */
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Compare entered password with hashed password
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Login attempt helpers
 */
UserSchema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.methods.incrementLoginAttempts = async function () {
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours
    if (this.lockUntil && this.lockUntil < Date.now()) {
        // lock expired → reset attempts
        this.loginAttempts = 1;
        this.lockUntil = undefined;
    } else {
        this.loginAttempts += 1;
        if (this.loginAttempts >= 5 && !this.isLocked) {
            this.lockUntil = Date.now() + lockTime;
        }
    }
    return this.save();
};

UserSchema.methods.resetLoginAttempts = async function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return this.save();
};

/**
 * Static: Create user with default role
 */
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

/**
 * Static: Approve pending role change
 */
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

/**
 * Instance: Request a role change
 */
UserSchema.methods.requestRoleChange = async function (requestedRoleId, reason) {
    this.requestedRoleId = requestedRoleId;
    this.roleRequestReason = reason;
    this.roleRequestedAt = new Date();
    return await this.save();
};

module.exports = mongoose.model('User', UserSchema);
