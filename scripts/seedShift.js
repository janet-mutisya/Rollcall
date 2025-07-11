const mongoose = require('mongoose');
const Shift = require('../models/shift');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Shift.deleteMany();

    const shifts = [
      { name: 'Morning Shift', startTime: '06:00', endTime: '14:00' },
      { name: 'Afternoon Shift', startTime: '14:00', endTime: '22:00' },
      { name: 'Night Shift', startTime: '22:00', endTime: '06:00' }
    ];

    await Shift.insertMany(shifts);
    console.log('Shifts seeded successfully');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
