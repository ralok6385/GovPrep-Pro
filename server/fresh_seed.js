const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const Question = require('./models/Question');
const Content = require('./models/Content');
const Subject = require('./models/Subject');
const Exam = require('./models/Exam');
const Test = require('./models/Test');

dotenv.config();
connectDB();

const freshSeed = async () => {
    try {
        console.log('🗑️  Cleaning old data...');
        // We do NOT delete Users or Exams to keep login/admin intact
        await Question.deleteMany();
        await Content.deleteMany();
        await Test.deleteMany();
        await Subject.deleteMany();

        console.log('✨ Starting fresh seed...');

        // 1. Get or Create Core Railways Exam
        let exam = await Exam.findOne({ slug: 'rrb-ntpc' });
        if (!exam) {
            exam = await Exam.create({
                name: 'RRB NTPC',
                slug: 'rrb-ntpc',
                description: 'Non-Technical Popular Categories'
            });
            console.log('Created missing exam: RRB NTPC');
        }

        // 2. Create Subjects
        const subjectsList = [
            { name: 'Mathematics', slug: 'math', description: 'Arithmetic, Algebra, Geom' },
            { name: 'General Intelligence (Reasoning)', slug: 'reasoning', description: 'Logical & Analytical' },
            { name: 'General Awareness', slug: 'ga', description: 'Current Affairs & GK' },
            { name: 'General Science', slug: 'science', description: 'Physics, Chem, Bio' }
        ];

        const createdSubjects = await Subject.insertMany(
            subjectsList.map(s => ({ ...s, examId: exam._id }))
        );
        console.log(`📚 Created ${createdSubjects.length} subjects`);

        // Helper Map
        const subMap = {};
        createdSubjects.forEach(s => subMap[s.slug] = s._id);

        // 3. Create Bulk Questions (Fresh & Realistic)
        const questions = [];

        // --- MATH (10 Qs) ---
        const mathQs = [
            { t: "If A:B = 2:3 and B:C = 4:5, find A:B:C.", opts: ["8:12:15", "6:8:10", "2:3:5", "8:10:15"], ans: "A" },
            { t: "The simple interest on a sum for 5 years is 2/5 of the sum. The rate percent per annum is:", opts: ["10%", "8%", "6%", "12%"], ans: "B" },
            { t: "A train running at speed of 60 km/hr crosses a pole in 9 seconds. Length of train is?", opts: ["120 m", "180 m", "324 m", "150 m"], ans: "D" },
            { t: "Find the value of (256)^0.16 * (256)^0.09", opts: ["4", "16", "64", "256.25"], ans: "A" },
            { t: "Two numbers are in ratio 3:4. Their HCF is 4. Their LCM is?", opts: ["12", "16", "24", "48"], ans: "D" },
            { t: "A can do a work in 15 days and B in 20 days. If they work together for 4 days, fraction of work left is?", opts: ["8/15", "7/15", "1/4", "1/10"], ans: "A" },
            { t: "Cost price of 20 articles is the same as selling price of x articles. If profit is 25%, find x.", opts: ["15", "16", "18", "25"], ans: "B" },
            { t: "Sum of first five prime numbers is?", opts: ["11", "18", "26", "28"], ans: "D" },
            { t: "If x% of y is 150 and y% of z is 300, then relation between x and z is?", opts: ["z=x", "z=2x", "x=2z", "z=3x"], ans: "B" },
            { t: "A mixture contains milk and water in ratio 5:1. On adding 5 liters of water, ratio becomes 5:2. Quantity of milk is?", opts: ["16L", "25L", "32.5L", "22.75L"], ans: "B" }
        ];

        mathQs.forEach(q => questions.push({
            text: q.t,
            options: [{ id: 'A', text: q.opts[0] }, { id: 'B', text: q.opts[1] }, { id: 'C', text: q.opts[2] }, { id: 'D', text: q.opts[3] }],
            correctOption: q.ans,
            subjectId: subMap['math'],
            difficulty: 'medium',
            topic: 'Arithmetic'
        }));

        // --- REASONING (10 Qs) ---
        const reasonQs = [
            { t: "Select related word: Train : Track :: Bus : ?", opts: ["Driver", "Road", "Passenger", "Fuel"], ans: "B" },
            { t: "Which number is wrong in series: 3, 8, 15, 24, 34, 48, 63", opts: ["15", "24", "34", "63"], ans: "C" },
            { t: "If CAT is coded as 3120, MAT is coded as?", opts: ["13120", "12120", "1312", "1213"], ans: "A" },
            { t: "Pointing to a photo, Bajpai said, 'He is the son of the only daughter of the father of my brother'. How is Bajpai related to the man?", opts: ["Nephew", "Brother", "Father", "Maternal Uncle"], ans: "D" },
            { t: "Find odd one out:", opts: ["Ginger", "Garlic", "Chilli", "Potato"], ans: "C" }, // Chilli grows above ground
            { t: "Statement: All mangoes are golden in colour. No golden-coloured things are cheap.\nConclusion:\nI. All mangoes are cheap.\nII. Golden-coloured mangoes are not cheap.", opts: ["Only I follows", "Only II follows", "Both follow", "None follow"], ans: "B" },
            { t: "Arrange in logic order: 1.Caterpillar 2.Butterfly 3.Egg 4.Cocoon", opts: ["3,4,1,2", "3,1,2,4", "3,1,4,2", "1,3,4,2"], ans: "C" },
            { t: "If A=1, FAT=27, then FAITH=?", opts: ["44", "42", "41", "40"], ans: "A" },
            { t: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", opts: ["(1/3)", "(1/8)", "(2/8)", "(1/16)"], ans: "B" },
            { t: "Suresh walks 18 km towards South. He turns to his right and walks 10 km. He turns to left and walks 15 km. How far is he from starting point (North-South wise)?", opts: ["33 km", "3 km", "5 km", "43 km"], ans: "A" }
        ];

        reasonQs.forEach(q => questions.push({
            text: q.t,
            options: [{ id: 'A', text: q.opts[0] }, { id: 'B', text: q.opts[1] }, { id: 'C', text: q.opts[2] }, { id: 'D', text: q.opts[3] }],
            correctOption: q.ans,
            subjectId: subMap['reasoning'],
            difficulty: 'medium',
            topic: 'Logical'
        }));

        // --- GENERAL AWARENESS (10 Qs) ---
        const gaQs = [
            { t: "Who was the first President of India?", opts: ["Jawaharlal Nehru", "Dr. Rajendra Prasad", "Dr. B.R. Ambedkar", "Mahatma Gandhi"], ans: "B" },
            { t: "The 'Theory of Relativity' was proposed by:", opts: ["Isaac Newton", "Albert Einstein", "Galileo", "Stephen Hawking"], ans: "B" },
            { t: "Capital of Australia is?", opts: ["Sydney", "Melbourne", "Canberra", "Perth"], ans: "C" },
            { t: "Which planet is known as the Red Planet?", opts: ["Venus", "Mars", "Jupiter", "Saturn"], ans: "B" },
            { t: "RBI was established in which year?", opts: ["1935", "1947", "1950", "1921"], ans: "A" },
            { t: "Chemical formula uses for Table Salt is?", opts: ["KCl", "NaCl", "CaCl2", "NaHCO3"], ans: "B" },
            { t: "Who wrote 'Discovery of India'?", opts: ["Mahatma Gandhi", "Sardar Patel", "Jawaharlal Nehru", "Indira Gandhi"], ans: "C" },
            { t: "National Science Day is observed on?", opts: ["Feb 24", "Feb 28", "Mar 8", "Jan 12"], ans: "B" },
            { t: "Which state is known as 'Spice Garden of India'?", opts: ["Kerala", "Karnataka", "Assam", "Andhra Pradesh"], ans: "A" },
            { t: "Longest river in the world?", opts: ["Nile", "Amazon", "Ganga", "Yangtze"], ans: "A" }
        ];

        gaQs.forEach(q => questions.push({
            text: q.t,
            options: [{ id: 'A', text: q.opts[0] }, { id: 'B', text: q.opts[1] }, { id: 'C', text: q.opts[2] }, { id: 'D', text: q.opts[3] }],
            correctOption: q.ans,
            subjectId: subMap['ga'],
            difficulty: 'easy',
            topic: 'Static GK'
        }));

        const insertedQs = await Question.insertMany(questions);
        console.log(`🧠 Seeded ${insertedQs.length} fresh questions`);

        // 4. Create Tests (Mock Exam & Quiz)
        const mockTest = await Test.create({
            title: 'RRB NTPC - Full Mock Test 01',
            examId: exam._id,
            questions: insertedQs.map(q => q._id),
            durationMinutes: 90,
            totalMarks: 100,
            type: 'exam',
            isPublished: true
        });
        console.log(`📝 Created Mock Exam: "${mockTest.title}"`);

        const speedQuiz = await Test.create({
            title: 'Math Speed Drill - Algebra',
            examId: exam._id,
            questions: insertedQs.slice(0, 10).map(q => q._id), // First 10 math questions
            durationMinutes: 15,
            totalMarks: 20,
            type: 'quiz',
            isPublished: true
        });
        console.log(`⚡ Created Speed Quiz: "${speedQuiz.title}"`);

        // 5. Create Fresh Videos
        const videos = [
            {
                title: "Complete Time & Work - 4 Hours Marathon",
                type: "video",
                url: "https://www.youtube.com/watch?v=Ke8XvJd_eYg", // Valid generic ID
                subjectId: subMap['math'],
                isPremium: false,
                topicName: "Time & Work"
            },
            {
                title: "Reasoning: Coding-Decoding Masterclass",
                type: "video",
                url: "https://www.youtube.com/watch?v=Ke8XvJd_eYg",
                subjectId: subMap['reasoning'],
                isPremium: false,
                topicName: "Coding Decoding"
            },
            {
                title: "Top 500 Current Affairs 2024-25",
                type: "video",
                url: "https://www.youtube.com/watch?v=Ke8XvJd_eYg",
                subjectId: subMap['ga'],
                isPremium: true,
                topicName: "Current Affairs"
            }
        ];

        await Content.insertMany(videos);
        console.log(`🎥 Seeded ${videos.length} videos`);

        console.log('✅ Fresh Seed Complete!');
        process.exit();

    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

freshSeed();
