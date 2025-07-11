
const SickSheet = require('../models/sickSheet');
const upload = require('../middleware/upload')

exports.uploadSickSheet = async (req, res) => {
  try {
    const sickSheet = await SickSheet.create({
      user: req.user.id,
      date: req.body.date,
      reason: req.body.reason,
      document: req.body.document 
    });
    res.status(201).json(sickSheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
