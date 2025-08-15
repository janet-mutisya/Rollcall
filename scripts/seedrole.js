const mongoose = require('mongoose');
const Role = require('../models/Role'); 
require('dotenv').config();

const roles = [

  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Can manage most parts of the system',
    level: 2,
    permissions: ['manage_users', 'view_reports', 'edit_reports'],
    canAssignRoles: ['manager', 'user'],
    isActive: true
  },
  {
    name: 'manager',
    displayName: 'Manager',
    description: 'Manages teams and operations',
    level: 3,
    permissions: ['view_reports', 'edit_reports'],
    canAssignRoles: ['user'],
    isActive: true
  },
  {
    name: 'user',
    displayName: 'Staff User',
    description: 'Regular user with limited permissions',
    level: 4,
    permissions: ['view_own_reports'],
    canAssignRoles: [],
    isActive: true
  }
];

async function seedRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    for (const role of roles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
        console.log(`Created role: ${role.name}`);
      } else {
        console.log(`Role already exists: ${role.name}`);
      }
    }

    console.log('Role seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();

