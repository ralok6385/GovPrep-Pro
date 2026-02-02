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
    const TestResult = require('./models/TestResult');

    // Get latest result
    const result = await TestResult.findOne().sort({ createdAt: -1 });

    if (result) {
        console.log('Total Questions in Result:', result.responses.length);
        console.log('Accuracy:', result.accuracy);
        console.log('Score:', result.score);
        console.log('Sample Response:', result.responses[0]);

        // Count skipped
        const skipped = result.responses.filter(r => !r.selectedOption).length;
        console.log('Skipped Count (in DB):', skipped);
    } else {
        console.log('No results found.');
    }

    process.exit();
};

check();
