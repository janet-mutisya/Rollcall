const express = require('express');
const cors = require ('cors');
require ('dotenv').config();
const connectDB = require('./config/db');


const PORT = process.env.PORT || 5000
const app = express();
connectDB();

app.use(cors());
app.use(express.json());
//routes
app.get('/', (req, res) => {
    res.json('welcome to attendance system')
});

const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

const roleRoutes = require('./routes/roleRoutes');
app.use('/api', roleRoutes);

const shiftRoutes = require('./routes/shiftRoutes');
app.use('/api', shiftRoutes);

const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api', attendanceRoutes);

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

const errorHandler = require('./middleware/errorhandler');
app.use(errorHandler);


app.listen(PORT, () => console.log(`server is running at http://localhost:${PORT}`))

