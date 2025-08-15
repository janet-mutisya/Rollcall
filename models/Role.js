const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        lowercase: true,
        trim: true,
        enum: ['user',  'manager', 'admin']
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    level: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    permissions: [{
        type: String,
        required: true
    }],
    canAssignRoles: [{
        type: String, // Role names that this role can assign
        enum: ['user', 'manager', 'admin']
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for performance
roleSchema.index({ name: 1 });
roleSchema.index({ level: 1 });

// Static method to check if a role can assign another role
roleSchema.statics.canAssignRole = async function(assignerRoleName, targetRoleName) {
    const assignerRole = await this.findOne({ name: assignerRoleName });
    if (!assignerRole) return false;
    
    return assignerRole.canAssignRoles.includes(targetRoleName);
};

// Static method to get roles that a user can assign
roleSchema.statics.getAssignableRoles = async function(userRoleName) {
    const userRole = await this.findOne({ name: userRoleName });
    if (!userRole) return [];
    
    return this.find({ 
        name: { $in: userRole.canAssignRoles },
        isActive: true 
    });
};

// Method to check if this role has a specific permission
roleSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

module.exports = mongoose.model('Role', roleSchema);