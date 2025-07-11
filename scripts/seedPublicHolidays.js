const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PublicHoliday = require('../models/publicHoliday.js');

dotenv.config()

const publicHolidays = [
  { Name: 'Christmas', date: new Date('2025-12-25'), isPaid: true },
  { Name: 'New Year', date: new Date('2025-01-01'), isPaid: true },
  { Name: 'Labour Day', date: new Date('2025-05-01'), isPaid: true },
  { Name: 'Huduma Day', date: new Date('2025-10-10'), isPaid: false }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await PublicHoliday.deleteMany(); // optional: clears existing holidays before seeding
    await PublicHoliday.insertMany(publicHolidays);
    console.log('Public holidays seeded successfully');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
