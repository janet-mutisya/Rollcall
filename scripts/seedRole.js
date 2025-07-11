const mongoose = require('mongoose');
const Role = require('../models/roles');
require('dotenv').config();

const roles = [
  { name: 'Admin', description: 'System administrator', permissions: ['manage_users', 'view_reports'] },
  { name: 'Branch Manager', description: 'Manages branch operations', permissions: ['approve_leave', 'view_reports'] },
  { name: 'Field Officer', description: 'Supervises guards on the field', permissions: ['view_attendance'] },
  { name: 'Security Officer', description: 'Normal guard duties', permissions: [] },
  { name: 'ABSA Guard', description: 'Guard assigned to ABSA Bank', permissions: [] },
  { name: 'Control Room Staff', description: 'Monitors CCTV and communication', permissions: [] },
  { name: 'Chef', description: 'Prepares meals for staff', permissions: [] }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Role.deleteMany(); 
    await Role.insertMany(roles);
    console.log('Roles seeded successfully');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
