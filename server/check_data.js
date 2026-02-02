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
    const Question = require('./models/Question');

    console.log('Aggregating Questions by Subject...');
    const results = await Question.aggregate([
        { $group: { _id: "$subjectId", count: { $sum: 1 } } }
    ]);

    console.log(results);
    process.exit();
};

check();
