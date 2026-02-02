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

const relink = async () => {
    await connectDB();
    const Content = require('./models/Content');
    const Subject = require('./models/Subject');

    const subjects = await Subject.find({});
    if (subjects.length === 0) {
        console.log('No subjects found!');
        process.exit();
    }

    // Simple distribution: Assign all content to the first subject, 
    // or distribute them. Let's assign to the first subject "General Awareness" for visibility.
    // Or even better, round-robin.

    const content = await Content.find({});

    for (let i = 0; i < content.length; i++) {
        const item = content[i];
        const targetSubject = subjects[i % subjects.length];

        item.subjectId = targetSubject._id;
        item.topicName = targetSubject.name; // Update topic name too
        await item.save();
        console.log(`Relinked '${item.title}' to '${targetSubject.name}'`);
    }

    console.log('Relinking complete.');
    process.exit();
};

relink();
