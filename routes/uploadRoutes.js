const express = require('express');
const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    message: 'File uploaded successfully',
    fileUrl: req.file.location
  });
});

module.exports = router;
