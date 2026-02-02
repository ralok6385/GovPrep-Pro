const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Test = require('./models/Test');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const checkTests = async () => {
    await connectDB();
    console.log('\n--- Checking Tests & Questions Linkage ---');
    try {
        const tests = await Test.find({}).populate('questions');
        if (tests.length === 0) {
            console.log('No tests found in database.');
        } else {
            console.log(`Found ${tests.length} tests:`);
            tests.forEach(t => {
                console.log(`\n[ID: ${t._id}]`);
                console.log(`Title: ${t.title}`);
                console.log(`Published: ${t.isPublished}`);
                console.log(`Total Questions Linked: ${t.questions.length}`);
                if (t.questions.length > 0) {
                    console.log(`Sample Q: ${t.questions[0].text.substring(0, 50)}...`);
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
};

checkTests();
