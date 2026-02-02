const mongoose = require('mongoose');
const dotenv = require('dotenv');
const RailwayJob = require('../models/RailwayJob');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const debugJobPosting = async () => {
    try {
        await connectDB();
        console.log('🔌 Connected to DB');

        // Find Admin
        const admin = await User.findOne({ email: 'lalanjeelalan@gmail.com' });
        if (!admin) {
            console.error('❌ Admin not found!');
            process.exit(1);
        }

        console.log(`👤 Posting as: ${admin.name} (${admin._id})`);

        // Payload Simulation
        const payload = {
            title: "TEST JOB POSTING",
            summary: "This is a debug job posting.",
            officialLink: "https://indianrailways.gov.in",
            applicationStartDate: "2024-10-01",
            applicationEndDate: "2024-10-31",
            eligibility: "12th Pass + ITI",
            postedBy: admin._id
        };

        console.log('📦 Payload:', payload);

        try {
            const job = await RailwayJob.create(payload);
            console.log('✅ Job Created Successfully:', job._id);
        } catch (validationError) {
            console.error('❌ Validation Error:', validationError.message);
            if (validationError.errors) {
                console.error('Stack:', JSON.stringify(validationError.errors, null, 2));
            }
        }

        process.exit();
    } catch (error) {
        console.error('❌ Server Error:', error);
        process.exit(1);
    }
};

debugJobPosting();
