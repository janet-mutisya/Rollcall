const mongoose = require('mongoose');
require('dotenv').config();
const SickSheet = require('../models/sickSheet');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.log(err));

const seedSickSheets = async () => {
  await SickSheet.deleteMany();

  const dummyData = [
    {
      user: '507f1f77bcf86cd799439011',
      reason: 'Malaria treatment',
      attachmentUrl: 'https://dummy-bucket.s3.amazonaws.com/malaria.pdf'
    },
    {
      user: '507f1f77bcf86cd799439011',
      reason: 'Dental surgery recovery',
      attachmentUrl: 'https://dummy-bucket.s3.amazonaws.com/dental.pdf'
    }
  ];

  await SickSheet.insertMany(dummyData);
  console.log('Dummy sick sheets seeded');
  mongoose.disconnect();
};

seedSickSheets();
