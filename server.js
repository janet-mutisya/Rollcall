const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json('welcome to attendance system');
});

// Import routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const roleRoutes = require('./routes/roleRoutes');
app.use('/api', roleRoutes);

const shiftRoutes = require('./routes/shiftRoutes');
app.use('/api', shiftRoutes);

const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance', attendanceRoutes);

const offdayRoutes = require('./routes/offdayRoutes');
app.use('/api', offdayRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

app.use('/uploads', express.static('uploads'));

const dispatchRoutes = require('./routes/dispatchRoute');
app.use('/api', dispatchRoutes);

const sickSheetsRoutes = require('./routes/sickSheetRoutes');
app.use('/api/sickSheets', sickSheetsRoutes);

const publicHolidayRoutes = require('./routes/publicHolidayRoutes');
app.use('/api', publicHolidayRoutes);

const emergencyRoutes = require('./routes/emergencyRoutes');
app.use('/api', emergencyRoutes);

const holidayAttendanceRoutes = require('./routes/holidayAttendanceRoutes');
app.use('/api', holidayAttendanceRoutes);

// Middleware
const errorHandler = require('./middleware/errorhandler');
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
