const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users'); // or inline
const User = require('./models/User');
const Exam = require('./models/Exam');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Exam.deleteMany();

        console.log('Data Destroyed...');

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin', // Will be hashed by pre-save hook
            role: 'admin'
        });

        console.log('Admin User Created: admin@example.com / admin');

        const exams = await Exam.insertMany([
            { name: 'SSC CGL', slug: 'ssc-cgl', description: 'Staff Selection Commission - Combined Graduate Level' },
            { name: 'IBPS PO', slug: 'ibps-po', description: 'Institute of Banking Personnel Selection - Probationary Officer' },
            { name: 'RRB NTPC', slug: 'rrb-ntpc', description: 'Railway Recruitment Board - Non-Technical Popular Categories' },
        ]);

        console.log('Sample Exams Created');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

importData();
