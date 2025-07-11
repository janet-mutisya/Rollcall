const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding users'))
  .catch(err => console.log(err));

// Seed function
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany();

    // Define sample users
    const users = [
      {
        name: 'John Mwangi',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        serviceNumber: 10001,
        phoneNumber: '0712345678',
        
      },
      {
        name: 'Mary Wanjiku',
        email: 'mary@example.com',
        password: await bcrypt.hash('password123', 10),
        serviceNumber: 10002,
        phoneNumber: '0723456789',
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('adminpassword', 10),
        serviceNumber: 10000,
        phoneNumber: '0700000000',
        
      }
    ];

    // Insert users
    await User.insertMany(users);
    console.log('Users seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
