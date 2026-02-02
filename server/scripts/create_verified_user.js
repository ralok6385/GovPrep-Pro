const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Exam = require('../models/Exam'); // Required for populate if schemas link
const connectDB = require('../config/db');

dotenv.config();

const createVerifiedUser = async () => {
    try {
        await connectDB();
        console.log('🔌 Connected to DB');

        const email = 'verified_student@lalan.com';
        const password = 'password123';

        // Check if user exists and delete
        await User.deleteOne({ email });
        console.log('🗑️  Cleaned up old user');

        const exam = await Exam.findOne({ slug: 'rrb-ntpc' });

        // Create User
        const user = await User.create({
            name: 'Verified Student',
            email,
            password,
            role: 'student',
            targetExam: 'NTPC',
            language: 'hi',
            selectedExam: exam ? exam._id : null
        });

        console.log(`✅ User Created: ${user.email}`);

        // Verify Password immediately
        const isMatch = await user.matchPassword(password);
        console.log(`🔐 Password Match Test: ${isMatch ? 'PASSED' : 'FAILED'}`);

        if (!isMatch) {
            console.error('❌ Hashing mechanism failed!');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createVerifiedUser();
