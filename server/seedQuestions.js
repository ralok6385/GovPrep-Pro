const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Subject = require('./models/Subject');
const Question = require('./models/Question');

dotenv.config();
connectDB();

const seedQuestions = async () => {
    try {
        console.log('Seeding Questions...');

        // 1. Fetch Subjects
        const subjects = await Subject.find({});
        if (subjects.length === 0) {
            console.error('No subjects found! Run "node seeder.js" first.');
            process.exit(1);
        }

        // 2. Prepare Questions
        const questionsToAdd = [];

        for (const subject of subjects) {
            // Determine category based on name/slug
            const name = subject.name.toLowerCase();
            let category = 'general';
            if (name.includes('quant')) category = 'math';
            else if (name.includes('reasoning')) category = 'reasoning';
            else if (name.includes('awareness') || name.includes('ga')) category = 'gk';

            // Add ~15 questions per subject
            for (let i = 1; i <= 15; i++) {
                questionsToAdd.push({
                    text: generateQuestionText(category, i),
                    options: [
                        { id: 'A', text: 'Option A' },
                        { id: 'B', text: 'Option B' },
                        { id: 'C', text: 'Option C' },
                        { id: 'D', text: 'Option D' }
                    ],
                    correctOption: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
                    explanation: 'This is a sample explanation for the question.',
                    subjectId: subject._id,
                    difficulty: i % 3 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy'
                });
            }
        }

        // 3. Clear old questions (Optional, maybe keep?) 
        // Let's clear to avoid dupes for now
        await Question.deleteMany({});
        console.log('Old questions removed.');

        // 4. Insert
        await Question.insertMany(questionsToAdd);
        console.log(`Successfully seeded ${questionsToAdd.length} questions across ${subjects.length} subjects.`);

        process.exit();
    } catch (error) {
        console.error('Error seeding questions:', error);
        process.exit(1);
    }
};

const generateQuestionText = (category, index) => {
    switch (category) {
        case 'math':
            return `What is the value of ${index} + ${index * 2}? (Sample Math Question)`;
        case 'reasoning':
            return `If A = ${index}, what is the position of Z? (Sample Reasoning Question)`;
        case 'gk':
            return `Question #${index}: Who is the current Prime Minister of India? (Sample GK)`;
        default:
            return `Sample Question ${index} for this subject.`;
    }
}

seedQuestions();
