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

const fix = async () => {
    await connectDB();
    const Subject = require('./models/Subject');

    // Set examId to null for ALL subjects
    const res = await Subject.updateMany({}, { $set: { examId: null } });
    console.log(`Updated ${res.modifiedCount} subjects to be Global (examId: null).`);

    process.exit();
};

fix();
