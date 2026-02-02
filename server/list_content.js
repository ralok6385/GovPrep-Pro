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
    const Content = require('./models/Content');
    const items = await Content.find({});
    console.log('Total Content Items:', items.length);
    items.forEach(i => console.log(`- ${i.title} (${i.type}) | Subject: ${i.subjectId}`));
    process.exit();
};

check();
