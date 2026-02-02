const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Subject = require('./models/Subject');
const Content = require('./models/Content');
const Exam = require('./models/Exam');

dotenv.config();
connectDB();

const seedContent = async () => {
    try {
        await Content.deleteMany();
        await Subject.deleteMany();

        console.log('Old Content & Subjects Destroyed...');

        // 0. Fetch an Exam to link subjects to (Assuming 'SSC CGL' exists or get any)
        let exam = await Exam.findOne({ slug: 'ssc-cgl' });
        if (!exam) {
            console.log('SSC CGL exam not found. Creating temporary one for seeding...');
            exam = await Exam.create({
                name: 'SSC CGL',
                slug: 'ssc-cgl',
                description: 'Staff Selection Commission - Combined Graduate Level'
            });
        }

        console.log(`Linking subjects to Exam: ${exam.name}`);

        // 1. Create Subjects
        const subjects = await Subject.insertMany([
            { name: 'Quantitative Aptitude', slug: 'quant', examId: exam._id, description: 'Mathematical problems and logic' },
            { name: 'General Awareness', slug: 'ga', examId: exam._id, description: 'Current affairs and history' },
            { name: 'English Language', slug: 'english', examId: exam._id, description: 'Grammar and comprehension' },
            { name: 'Reasoning', slug: 'reasoning', examId: exam._id, description: 'Logical reasoning abilities' }
        ]);

        console.log('Subjects Created:', subjects.map(s => s.name).join(', '));

        // Helper to find ID
        const getSubId = (slug) => subjects.find(s => s.slug === slug)._id;

        // 2. Create Content
        const contentData = [
            // Quantitative Aptitude
            {
                title: 'Percentage Tricks & Shortcuts',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=12345fake', // Mock URL
                subjectId: getSubId('quant'),
                topicName: 'Percentage',
                isPremium: false
            },
            {
                title: 'Profit & Loss Formulas PDF',
                type: 'pdf',
                url: 'https://example.com/profit-loss.pdf',
                subjectId: getSubId('quant'),
                topicName: 'Profit & Loss',
                isPremium: false
            },

            // General Awareness
            {
                title: 'Modern Indian History Timeline',
                type: 'pdf',
                url: 'https://example.com/history.pdf',
                subjectId: getSubId('ga'),
                topicName: 'History',
                isPremium: false
            },
            {
                title: 'Current Affairs - Jan 2026',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=news2026',
                subjectId: getSubId('ga'),
                topicName: 'Current Affairs',
                isPremium: true
            },

            // English
            {
                title: '100 Common Grammar Errors',
                type: 'pdf',
                url: 'https://example.com/grammar.pdf',
                subjectId: getSubId('english'),
                topicName: 'Grammar',
                isPremium: false
            },

            // Reasoning
            {
                title: 'Blood Relations Explained',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=bloodrel',
                subjectId: getSubId('reasoning'),
                topicName: 'Blood Relations',
                isPremium: false
            }
        ];

        await Content.insertMany(contentData);
        console.log(`Created ${contentData.length} content items.`);

        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

seedContent();
