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

const check = async () => {
    await connectDB();
    const Subject = require('./models/Subject');
    const Exam = require('./models/Exam');

    // List Exams
    const exams = await Exam.find({});
    console.log('Exams:', exams.map(e => `${e.name} (${e._id})`));

    // List Subjects
    const subjects = await Subject.find({});
    console.log('Total Subjects:', subjects.length);
    subjects.forEach(s => {
        console.log(`- ${s.name} (ID: ${s._id}) | ExamID: ${s.examId}`);
    });

    process.exit();
};

check();
