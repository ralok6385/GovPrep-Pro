const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const checkUser = async () => {
    try {
        await connectDB();

        const email = 'lalanjeelalan@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User NOT FOUND in database.');
        } else {
            console.log(`User FOUND: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Password Hash: ${user.password}`);
            const isMatch = await user.matchPassword('admin');
            console.log(`Password 'admin' match result: ${isMatch}`);
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
