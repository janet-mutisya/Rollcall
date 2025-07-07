const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('connected to mongoDB');

}catch(error)
{console.error(error,'Cannot connect to mongoDB', err.message)
    process.exit(1);

}
    };
    
    
module.exports = connectDB;