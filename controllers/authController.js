const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Input validation helper
const validateInput = (data, requiredFields) => {
    const errors = [];
    requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
            errors.push(`${field} is required`);
        }
    });
    return errors;
};

// Password strength validation
const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return errors;
};

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { 
            userId, 
            role: role.name,
            roleLevel: role.level,
            permissions: role.permissions 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRE || '7d',
            issuer: 'your-app-name',
            audience: 'your-app-users'
        }
    );
};

// PUBLIC SIGNUP - Always creates user with default 'user' role
const signup = async (req, res) => {
    try {
        const { name, email, password, serviceNumber, phoneNumber } = req.body;

        // Input validation - Remove roleId from allowed fields
        const validationErrors = validateInput(req.body, ['name', 'email', 'password', 'serviceNumber']);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Password strength validation
        const passwordErrors = validatePasswordStrength(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordErrors
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { serviceNumber: serviceNumber.trim() }
            ]
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase().trim() ? 'email' : 'service number';
            return res.status(409).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        // Create user with default role using secure method
        const user = await User.createUserWithRole({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            serviceNumber: serviceNumber.trim(),
            phoneNumber: phoneNumber?.trim()
        });

        // Populate role information
        await user.populate('roleId');

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                serviceNumber: user.serviceNumber,
                phoneNumber: user.phoneNumber,
                role: user.roleId.displayName,
                approvalStatus: user.approvalStatus,
                createdAt: user.createdAt
            },
        });

    } catch (error) {
        console.error("Signup error:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ADMIN-ONLY USER CREATION with role assignment
const createUserWithRole = async (req, res) => {
    try {
        const { name, email, password, serviceNumber, phoneNumber, roleId } = req.body;

        // Verify admin has permission to create users
        const adminRole = await Role.findOne({ name: req.user.role });
        if (!adminRole || !adminRole.hasPermission('create_users')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create users'
            });
        }

        // Validate that admin can assign this role
        const targetRole = await Role.findById(roleId);
        if (!targetRole) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        const canAssign = await Role.canAssignRole(req.user.role, targetRole.name);
        if (!canAssign) {
            return res.status(403).json({
                success: false,
                message: `You don't have permission to assign ${targetRole.displayName} role`
            });
        }

        // Input validation
        const validationErrors = validateInput(req.body, ['name', 'email', 'password', 'serviceNumber', 'roleId']);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Password strength validation
        const passwordErrors = validatePasswordStrength(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordErrors
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { serviceNumber: serviceNumber.trim() }
            ]
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase().trim() ? 'email' : 'service number';
            return res.status(409).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        // Create user with specified role
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            serviceNumber: serviceNumber.trim(),
            phoneNumber: phoneNumber?.trim(),
            roleId,
            approvalStatus: 'approved',
            approvedBy: req.user.userId,
            approvedAt: new Date()
        });

        await user.populate('roleId');

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                serviceNumber: user.serviceNumber,
                phoneNumber: user.phoneNumber,
                role: user.roleId.displayName,
                createdBy: req.user.userId,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Request role change (for users to request higher roles)
const requestRoleChange = async (req, res) => {
    try {
        const { requestedRoleId, reason } = req.body;

        if (!requestedRoleId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Requested role and reason are required'
            });
        }

        const user = await User.findById(req.user.userId).populate('roleId');
        const requestedRole = await Role.findById(requestedRoleId);

        if (!requestedRole) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role requested'
            });
        }

        // Prevent requesting same role or lower level role
        if (requestedRole.level <= user.roleId.level) {
            return res.status(400).json({
                success: false,
                message: 'Can only request higher level roles'
            });
        }

        await user.requestRoleChange(requestedRoleId, reason);

        res.json({
            success: true,
            message: 'Role change request submitted successfully',
            request: {
                requestedRole: requestedRole.displayName,
                reason: reason,
                requestedAt: user.roleRequestedAt
            }
        });

    } catch (error) {
        console.error('Role request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Approve role change (admin only)
const approveRoleChange = async (req, res) => {
    try {
        const { userId } = req.params;
        const { approved } = req.body;

        // Check admin permissions
        const adminRole = await Role.findOne({ name: req.user.role });
        if (!adminRole || !adminRole.hasPermission('manage_roles')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to manage roles'
            });
        }

        const user = await User.findById(userId).populate(['roleId', 'requestedRoleId']);
        if (!user || !user.requestedRoleId) {
            return res.status(404).json({
                success: false,
                message: 'No pending role request found'
            });
        }

        if (approved) {
            // Check if admin can assign this role
            const canAssign = await Role.canAssignRole(req.user.role, user.requestedRoleId.name);
            if (!canAssign) {
                return res.status(403).json({
                    success: false,
                    message: `You don't have permission to assign ${user.requestedRoleId.displayName} role`
                });
            }

            await User.approveRoleChange(userId, req.user.userId);
            await user.populate('roleId');

            res.json({
                success: true,
                message: 'Role change approved successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    newRole: user.roleId.displayName,
                    approvedAt: user.approvedAt
                }
            });
        } else {
            // Reject the role request
            user.requestedRoleId = undefined;
            user.roleRequestReason = undefined;
            user.roleRequestedAt = undefined;
            await user.save();

            res.json({
                success: true,
                message: 'Role change request rejected'
            });
        }

    } catch (error) {
        console.error('Role approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get assignable roles (for admins)
const getAssignableRoles = async (req, res) => {
    try {
        const roles = await Role.getAssignableRoles(req.user.role);
        
        res.json({
            success: true,
            roles: roles.map(role => ({
                id: role._id,
                name: role.name,
                displayName: role.displayName,
                description: role.description,
                level: role.level
            }))
        });
    } catch (error) {
        console.error('Get assignable roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const validationErrors = validateInput(req.body, ['email', 'password']);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ 
            email: email.toLowerCase().trim(),
            isActive: true,
            approvalStatus: 'approved' // Only approved users can login
        }).populate('roleId');

        const invalidCredentialsMsg = "Invalid email or password";

        if (!user) {
            return res.status(401).json({
                success: false,
                message: invalidCredentialsMsg
            });
        }

        if (user.isLocked) {
            return res.status(423).json({
                success: false,
                message: "Account is temporarily locked due to too many failed login attempts. Please try again later."
            });
        }

        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            await user.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: invalidCredentialsMsg
            });
        }

        await user.resetLoginAttempts();
        const token = generateToken(user._id, user.roleId);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                serviceNumber: user.serviceNumber,
                phoneNumber: user.phoneNumber,
                role: user.roleId.displayName,
                roleLevel: user.roleId.level,
                permissions: user.roleId.permissions,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('roleId')
            .select('-password -loginAttempts -lockUntil');
            
        if (!user || !user.isActive) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                serviceNumber: user.serviceNumber,
                phoneNumber: user.phoneNumber,
                role: user.roleId.displayName,
                roleLevel: user.roleId.level,
                permissions: user.roleId.permissions,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                // Include role request info if pending
                ...(user.requestedRoleId && {
                    pendingRoleRequest: {
                        requestedRole: user.requestedRoleId,
                        reason: user.roleRequestReason,
                        requestedAt: user.roleRequestedAt
                    }
                })
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Fixed: should be userId, not id

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update only the fields provided
        const { name, email, phoneNumber } = req.body; // Fixed: use phoneNumber consistently
        if (name) user.name = name.trim();
        if (email) user.email = email.toLowerCase().trim();
        if (phoneNumber) user.phoneNumber = phoneNumber.trim();

        const updatedUser = await user.save();
        await updatedUser.populate('roleId');

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                serviceNumber: updatedUser.serviceNumber,
                phoneNumber: updatedUser.phoneNumber,
                role: updatedUser.roleId.displayName
            }
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const validationErrors = validateInput(req.body, ['currentPassword', 'newPassword']);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Validate new password strength
        const passwordErrors = validatePasswordStrength(newPassword);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'New password does not meet security requirements',
                errors: passwordErrors
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        // Clear the cookie
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 5 * 1000),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Export all functions
module.exports = {
    authLimiter,
    signup,
    createUserWithRole,
    requestRoleChange,
    approveRoleChange,
    getAssignableRoles,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout
};