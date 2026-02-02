const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Failed:', err);
        process.exit(1);
    }
};

const del = async () => {
    await connectDB();
    const User = require('./models/User');
    await User.deleteOne({ email: 'testuser_gamification@example.com' });
    console.log('Test User Deleted');
    process.exit();
};

del();
