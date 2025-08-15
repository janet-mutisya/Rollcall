const Role = require("../models/Role");

// Allowed roles in the system
const ALLOWED_ROLES = ["admin", "manager", "user"];

// Create a role
exports.createRole = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to create roles" });
    }

    const { name } = req.body;
    if (!ALLOWED_ROLES.includes(name.toLowerCase())) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }

    const existingRole = await Role.findOne({ name: name.toLowerCase() });
    if (existingRole) {
      return res.status(400).json({ success: false, message: "Role already exists" });
    }

    const role = await Role.create({ name: name.toLowerCase() });
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// Get a role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }
    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, count: roles.length, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update role (only admin/manager)
exports.updateRole = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to update roles" });
    }

    const { name } = req.body;
    if (name && !ALLOWED_ROLES.includes(name.toLowerCase())) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }

    const role = await Role.findByIdAndUpdate(req.params.id, { name: name.toLowerCase() }, { new: true });
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can delete roles" });
    }

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    if (["manager"].includes(role.name)) {
      return res.status(400).json({ success: false, message: "Cannot delete manager roles" });
    }

    await role.deleteOne();
    res.status(200).json({ success: true, message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
