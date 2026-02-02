const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users'); // or inline
const User = require('./models/User');
const Exam = require('./models/Exam');
const Subject = require('./models/Subject');
const connectDB = require('./config/db');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();
        await User.deleteMany();
        await Exam.deleteMany();
        await Subject.deleteMany(); // Clear old subjects

        console.log('Data Destroyed...');

        const exams = await Exam.insertMany([
            { name: 'RRB NTPC', slug: 'rrb-ntpc', description: 'Railway Recruitment Board - Non-Technical Popular Categories' },
            { name: 'RRB Group D', slug: 'rrb-group-d', description: 'RRB Group D (Level 1)' },
            { name: 'RRB ALP', slug: 'rrb-alp', description: 'Assistant Loco Pilot' },
            { name: 'RRB JE', slug: 'rrb-je', description: 'Junior Engineer' },
        ]);

        console.log('Railway Exams Created');

        // Assign NTPC as default for Admin
        const ntpcExam = exams.find(e => e.slug === 'rrb-ntpc');

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'lalanjeelalan@gmail.com',
            password: 'admin', // Will be hashed by pre-save hook
            role: 'admin',
            selectedExam: ntpcExam._id // Set a default
        });

        console.log('Admin User Created: lalanjeelalan@gmail.com / admin');

        const studentUser = await User.create({
            name: 'Student User',
            email: 'student@example.com',
            password: 'student',
            role: 'student',
            selectedExam: ntpcExam._id
        });

        console.log('Student User Created: student@example.com / student');

        console.log('Sample Exams Created');

        // Create Subjects for each Exam
        const subjectsData = [];

        // Define common subjects
        const commonSubjects = [
            { name: 'Quantitative Aptitude', slug: 'quant', description: 'Mathematical problems' },
            { name: 'Reasoning Ability', slug: 'reasoning', description: 'Logical reasoning' },
            { name: 'General Awareness', slug: 'ga', description: 'GK and Current Affairs' },
            { name: 'English Language', slug: 'english', description: 'Grammar and Comprehension' }
        ];

        exams.forEach(exam => {
            commonSubjects.forEach(sub => {
                subjectsData.push({
                    name: sub.name,
                    slug: `${sub.slug}-${exam.slug}`, // Unique slug per exam-subject combo
                    examId: exam._id,
                    description: sub.description,
                    topics: []
                });
            });
        });

        await Subject.insertMany(subjectsData);
        console.log(`Created ${subjectsData.length} Subjects linked to Exams`);

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

importData();
