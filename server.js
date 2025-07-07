const express = require('express');
const cors = require ('cors');
require ('dotenv').config();
const connectDB = require('./config/db');


const PORT = process.env.PORT || 5000
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => console.log(`server is running at http://localhost:${PORT}`))

