const mongoose = require('mongoose');
const Attendance = require('../models/attendance');
const dotenv = require('dotenv');
dotenv.config();

// connect to mongo
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    await Attendance.deleteMany();

    const sampleAttendance = [
      {
        user: new mongoose.Types.ObjectId(), 
        date: new Date('2025-07-09'),
        clockIn: '08:00',
        clockOut: '17:00',
        status: 'present',
        shiftId: new mongoose.Types.ObjectId(), // dummy shift id
        location: 'ABSA Bank'
      },
      {
        user: new mongoose.Types.ObjectId(),
        date: new Date('2025-07-09'),
        clockIn: '09:00',
        clockOut: '18:00',
        status: 'late',
        shiftId: new mongoose.Types.ObjectId(),
        location: 'Control Room'
      }
    ];

    await Attendance.insertMany(sampleAttendance);
    console.log('Attendance seeded successfully');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

