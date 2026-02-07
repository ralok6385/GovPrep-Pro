const Test = require('../models/Test');
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private/Admin
const createTest = async (req, res) => {
    try {
        let {
            title,
            examId,
            durationMinutes,
            totalMarks,
            questions,
            positiveMark,
            negativeMark,
            type,
            description
        } = req.body;

        // --- Builder Support: Questions as Objects ---
        if (questions && questions.length > 0 && typeof questions[0] === 'object') {
            const Question = require('../models/Question');
            const newIds = [];

            for (const q of questions) {
                const createdQ = await Question.create({
                    text: q.text,
                    options: q.options.map((opt, i) => ({
                        id: String.fromCharCode(65 + i), // A, B...
                        text: opt.text
                    })),
                    // Convert builder opt1 -> A
                    correctOption: String.fromCharCode(65 + q.options.findIndex(o => o.id === q.correctOption)),
                    type: 'multiple-choice',
                    explanation: 'Created via Builder',
                    subjectId: null // or pass it
                });
                newIds.push(createdQ._id);
            }
            questions = newIds; // Replace with IDs
        }

        // Validation
        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ message: 'Please fill all fields and select questions' });
        }

        const test = await Test.create({
            title,
            examId,
            durationMinutes,
            totalMarks,
            questions,
            positiveMark,
            negativeMark,
            type: type || 'exam',
            isPublished: true,
        });

        // Emit real-time notification
        if (req.io) {
            req.io.emit('new_test_alert', {
                title: test.title,
                testId: test._id,
                type: test.type,
                createdAt: test.createdAt
            });
        }

        res.status(201).json(test);
    } catch (error) {
        console.error('Create Test Error:', error);
        res.status(500).json({ message: error.message || 'Failed to create test' });
    }
};

// @desc    Get all published tests (for students)
// @route   GET /api/tests
// @access  Private
const getAllTests = async (req, res) => {
    try {
        const query = req.user && req.user.role === 'admin' ? {} : { isPublished: true };
        const tests = await Test.find(query)
            .populate('examId', 'name slug')
            .sort({ createdAt: -1 }); // Removed .select('-questions') for admins so they see count, or handle carefully?

        // Optimization: tests.map to just send count for questions
        const finalTests = tests.map(t => ({
            _id: t._id,
            title: t.title,
            examId: t.examId,
            durationMinutes: t.durationMinutes,
            questionsCount: t.questions.length,
            isPublished: t.isPublished,
            type: t.type,
            createdAt: t.createdAt
        }));

        // Check for attempts (if student)
        if (req.user && req.user.role === 'student') {
            const attempts = await TestResult.find({ studentId: req.user._id }).select('testId');
            const attemptedIds = new Set(attempts.map(a => a.testId.toString()));

            finalTests.forEach(t => {
                t.isAttempted = attemptedIds.has(t._id.toString());
            });
        }

        res.json(finalTests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching tests' });
    }
};

// @desc    Get all tests for an exam
// @route   GET /api/tests/exam/:examId
// @access  Private (Student)
const getTestsByExam = async (req, res) => {
    try {
        const tests = await Test.find({
            examId: req.params.examId,
            isPublished: true,
        }).select('-questions').lean(); // Use lean for modifying

        // Check for attempts (if student)
        if (req.user && req.user.role === 'student') {
            const attempts = await TestResult.find({ studentId: req.user._id }).select('testId');
            const attemptedIds = new Set(attempts.map(a => a.testId.toString()));

            tests.forEach(t => {
                t.isAttempted = attemptedIds.has(t._id.toString());
            });
        }
        res.json(tests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching exam tests' });
    }
};

// @desc    Get single test (Metadata only)
// @route   GET /api/tests/:id
// @access  Private
const getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).select('-questions'); // Fetch meta only

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // We might want to know question count, but questions are excluded.
        // Let's re-fetch just the question array length if needed? 
        // Or just include questions ID array but not populated?
        // Actually, MongoDB document has the array of IDs in 'questions' field if we don't populate.
        // But we used .select('-questions').
        // Let's remove .select('-questions') and NOT populate. 
        // That way we get the array of IDs and can count them.

        const testWithIds = await Test.findById(req.params.id);
        // We don't populate, so valid.

        if (!testWithIds) return res.status(404).json({ message: 'Test not found' });

        res.json(testWithIds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Start test (Get questions without answers)
// @route   GET /api/tests/:id/start
// @access  Private (Student)
const startTest = async (req, res) => {
    const test = await Test.findById(req.params.id).populate('questions');

    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    console.log(`[Start Test] Test: ${test.title}, Raw Questions: ${test.questions?.length || 0}`);

    // Security: Remove correctOption from questions
    const sanitizedQuestions = test.questions.map((q) => {
        if (!q.text) console.warn(`[Start Test] Question ${q._id} has no text!`);
        return {
            _id: q._id,
            text: q.text,
            textHindi: q.textHindi,
            options: q.options.map(opt => ({
                id: opt.id,
                text: opt.text,
                textHindi: opt.textHindi
            })),
        };
    });

    console.log(`[Start Test] Sending ${sanitizedQuestions.length} sanitized questions.`);

    // Check if already attempted
    const existingResult = await TestResult.findOne({ studentId: req.user._id, testId: req.params.id });
    if (existingResult) {
        return res.status(403).json({ message: 'You have already attempted this test', attemptId: existingResult._id });
    }

    res.json({
        _id: test._id,
        title: test.title,
        durationMinutes: test.durationMinutes,
        questions: sanitizedQuestions,
    });
};

// @desc    Submit test and calculate score
// @route   POST /api/tests/:id/submit
// @access  Private (Student)
const submitTest = async (req, res) => {
    const { responses, tabSwitchWarnings, isAutoSubmitted } = req.body; // [{ questionId, selectedOption, timeTaken }]
    const test = await Test.findById(req.params.id).populate('questions');

    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;

    const processedResponses = test.questions.map((question) => {
        const resp = responses.find(r => r.questionId === question._id.toString());

        let isCorrect = false;
        let selectedOption = null;
        let timeTakenSeconds = 0;

        if (resp) {
            selectedOption = resp.selectedOption;
            timeTakenSeconds = resp.timeTakenSeconds || 0;

            if (selectedOption === question.correctOption) {
                isCorrect = true;
                score += test.positiveMark;
                correctCount++;
            } else if (selectedOption) {
                // Attempted but wrong
                score -= test.negativeMark;
                wrongCount++;
            }
            // If selectedOption is null/empty but resp exists, it's a skip (already handled by defaults)
        }

        return {
            questionId: question._id,
            selectedOption,
            correctOption: question.correctOption, // Store correct answer for review
            isCorrect,
            timeTakenSeconds
        };
    });

    const accuracy =
        processedResponses.length > 0
            ? (correctCount / processedResponses.length) * 100
            : 0;

    const result = await TestResult.create({
        studentId: req.user._id,
        testId: test._id,
        score,
        accuracy,
        responses: processedResponses,
        tabSwitchWarnings: tabSwitchWarnings || 0,
        isAutoSubmitted: isAutoSubmitted || false,
    });

    // Calculate Rank immediately for storage
    const allResults = await TestResult.find({ testId: test._id }).select('score').sort({ score: -1 });
    const allScores = allResults.map(r => r.score);
    const rank = allScores.indexOf(score) + 1;
    const totalParticipants = allScores.length;

    // Update with rank
    await TestResult.findByIdAndUpdate(result._id, { rank, totalParticipants });

    const populatedResult = await TestResult.findById(result._id)
        .populate('testId')
        .populate({
            path: 'responses.questionId',
            model: 'Question'
        });

    console.log('SUBMIT TEST - Populated Question 0:', populatedResult.responses[0]?.questionId);

    // --- GAMIFICATION START ---
    let responseData = populatedResult.toObject();
    try {
        const { awardXP } = require('./gamificationController');
        // Base XP: 50, Plus 1 XP per 1% accuracy
        const totalXP = 50 + Math.round(result.accuracy || 0);

        const gamification = await awardXP(req.user._id, totalXP, 'Test Completion');
        if (gamification) {
            responseData.gamification = gamification;
        }
    } catch (gamificationError) {
        console.error('[Gamification Error]', gamificationError);
    }
    // --- GAMIFICATION END ---

    res.json(responseData);
};

// @desc    Get all test results (Admin Analytics)
// @route   GET /api/tests/results/all
// @access  Private/Admin
const getAllResults = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { search, testId } = req.query;

        // Build Query
        const query = {};

        if (testId && testId !== 'all') {
            query.testId = testId;
        }

        // If search provided, find matching users first
        if (search) {
            const User = require('../models/User');
            const userQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
            const students = await User.find(userQuery).select('_id');
            const studentIds = students.map(u => u._id);

            if (studentIds.length === 0) {
                return res.json({
                    totalTests: 0,
                    avgScore: 0,
                    totalPages: 0,
                    currentPage: page,
                    results: []
                });
            }
            query.studentId = { $in: studentIds };
        }

        const totalTests = await TestResult.countDocuments(query);

        // Use aggregation to calculate average score efficiently
        const stats = await TestResult.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$score' }
                }
            }
        ]);
        const avgScore = stats.length > 0 ? stats[0].avgScore.toFixed(1) : 0;

        // Fetch paginated results
        const results = await TestResult.find(query)
            .populate('studentId', 'name email')
            .populate('testId', 'title totalMarks type')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            totalTests,
            avgScore,
            totalPages: Math.ceil(totalTests / limit),
            currentPage: page,
            results
        });
    } catch (error) {
        console.error('[GetAllResults Error]:', error);
        res.status(500).json({ message: 'Server Error fetching results' });
    }
};

// @desc    Get single test result
// @route   GET /api/tests/results/:id
// @access  Private
const getTestResult = async (req, res) => {
    try {
        const result = await TestResult.findById(req.params.id)
            .populate('testId')
            .populate({
                path: 'responses.questionId',
                model: 'Question',
                populate: {
                    path: 'subjectId',
                    model: 'Subject',
                    select: 'name'
                }
            });

        console.log('GET RESULT - Populated Question 0:', result?.responses[0]?.questionId);

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        // Verify ownership (unless admin)
        if (result.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to view this result' });
        }

        // Calculate Rank for this specific test
        const testId = result.testId._id;
        const allScores = await TestResult.find({ testId }).select('score').sort({ score: -1 }).lean();

        const myScore = result.score;
        const totalParticipants = allScores.length;

        // Find index of first appearance of my score in sorted list
        const rank = allScores.findIndex(s => s.score <= myScore) + 1;

        // [NEW] Subject Wise Analysis for this specific test
        const subjectAnalysis = {};

        result.responses.forEach(resp => {
            const question = resp.questionId;
            if (question && question.subjectId) {
                const subId = question.subjectId._id.toString();
                const subName = question.subjectId.name || 'General';

                if (!subjectAnalysis[subId]) {
                    subjectAnalysis[subId] = {
                        name: subName,
                        total: 0,
                        correct: 0,
                        wrong: 0,
                        skipped: 0
                    };
                }

                subjectAnalysis[subId].total++;
                if (resp.selectedOption) {
                    if (resp.isCorrect) subjectAnalysis[subId].correct++;
                    else subjectAnalysis[subId].wrong++;
                } else {
                    subjectAnalysis[subId].skipped++;
                }
            }
        });

        // Convert to plain object to add custom fields
        const finalResult = result.toObject();
        finalResult.rank = rank;
        finalResult.totalParticipants = totalParticipants;
        finalResult.subjectAnalysis = Object.values(subjectAnalysis);

        res.json(finalResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching result' });
    }
};

// @desc    Update test result (Admin)
// @route   PUT /api/tests/results/:id
// @access  Private/Admin
const updateTestResult = async (req, res) => {
    try {
        const { score } = req.body;
        const result = await TestResult.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        result.score = score;
        // recalculate accuracy? Simple update or full regrading? 
        // For now just update score as requested.
        await result.save();

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed' });
    }
};

const deleteTestResult = async (req, res) => {
    try {
        const result = await TestResult.findById(req.params.id);
        if (!result) return res.status(404).json({ message: 'Result not found' });

        await result.deleteOne();
        res.json({ message: 'Result removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Delete failed' });
    }
};

// @desc    Update Test (Publish/Unpublish/Edit)
// @route   PUT /api/tests/:id
// @access  Private/Admin
const updateTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        // Update fields if they exist in body
        const { isPublished, title, examId, questions, durationMinutes, totalMarks, positiveMark, negativeMark } = req.body;

        if (isPublished !== undefined) test.isPublished = isPublished;
        if (title) test.title = title;
        if (examId) test.examId = examId;
        if (questions) test.questions = questions;
        if (durationMinutes) test.durationMinutes = durationMinutes;
        if (totalMarks) test.totalMarks = totalMarks;
        if (positiveMark) test.positiveMark = positiveMark;
        if (negativeMark) test.negativeMark = negativeMark;

        await test.save();
        res.json(test);
    } catch (error) {
        console.error('Update Test Error:', error);
        res.status(500).json({ message: 'Failed to update test' });
    }
};

// @desc    Delete Test (and cascade results?)
// @route   DELETE /api/tests/:id
// @access  Private/Admin
const deleteTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        await test.deleteOne();
        // Ideally delete related results too, but keeping for history might be safer.
        // For strict cleanup: await TestResult.deleteMany({ testId: req.params.id });

        res.json({ message: 'Test deleted' });
    } catch (error) {
        console.error('Delete Test Error:', error);
        res.status(500).json({ message: 'Failed to delete test' });
    }
};

// @desc    Get current student's test results history
// @route   GET /api/tests/results/me
// @access  Private
const getMyResults = async (req, res) => {
    try {
        const results = await TestResult.find({ studentId: req.user._id })
            .populate('testId', 'title type totalMarks')
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        console.error('Get My Results Error:', error);
        res.status(500).json({ message: 'Failed to fetch test history' });
    }
};

// @desc    Generate a smart test based on weaknesses
// @route   POST /api/tests/generate
// @access  Private (Student)
const generateSmartTest = async (req, res) => {
    try {
        const studentId = req.user._id;
        const mongoose = require('mongoose');

        console.log(`[SmartTest] Generating for ${studentId}`);

        // 1. Identify Weak Areas (Reuse Logic)
        const weakStats = await TestResult.aggregate([
            { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
            { $unwind: "$responses" },
            {
                $lookup: {
                    from: "questions",
                    localField: "responses.questionId",
                    foreignField: "_id",
                    as: "question"
                }
            },
            { $unwind: "$question" },
            {
                $group: {
                    _id: "$question.subjectId",
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { $sum: { $cond: ["$responses.isCorrect", 1, 0] } }
                }
            },
            {
                $project: {
                    subjectId: "$_id",
                    accuracy: { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }
                }
            },
            { $match: { accuracy: { $lt: 50 } } }, // Filter weak subjects (< 50%)
            { $limit: 3 }
        ]);

        let targetSubjectIds = weakStats.map(s => s.subjectId);

        // Fallback: If no weak areas, pick random subjects
        if (targetSubjectIds.length === 0) {
            console.log('[SmartTest] No specific weak areas found, picking random subjects.');
            const randomSubjects = await require('../models/Subject').aggregate([{ $sample: { size: 3 } }]);
            targetSubjectIds = randomSubjects.map(s => s._id);
        }

        console.log(`[SmartTest] Target Subjects: ${targetSubjectIds}`);

        // 2. Fetch Questions (15 Random from these subjects)
        let questions = await Question.aggregate([
            { $match: { subjectId: { $in: targetSubjectIds } } },
            { $sample: { size: 15 } },
            { $project: { _id: 1 } } // Only get IDs
        ]);

        // [FALLBACK] If we don't have enough questions (e.g. data quality issues), fetch random ones globally
        if (questions.length < 15) {
            console.log(`[SmartTest] Only found ${questions.length} subject-specific questions. Fetching global randoms...`);
            const existingIds = questions.map(q => q._id);
            const needed = 15 - questions.length;

            const randomQuestions = await Question.aggregate([
                { $match: { _id: { $nin: existingIds } } }, // Avoid duplicates
                { $sample: { size: needed } },
                { $project: { _id: 1 } }
            ]);

            questions = [...questions, ...randomQuestions];
        }

        if (questions.length === 0) {
            return res.status(404).json({ message: 'Not enough questions available to generate a test.' });
        }

        const questionIds = questions.map(q => q._id);

        // Get Exam ID (User's preference or First available)
        let examId = req.user.selectedExam;
        if (!examId) {
            const anyExam = await require('../models/Exam').findOne();
            examId = anyExam._id;
        }

        // 3. Create Temporary Test
        const test = await Test.create({
            title: `Smart Practice: ${new Date().toLocaleDateString()}`,
            examId: examId,
            durationMinutes: 15,
            totalMarks: questionIds.length * 2, // Assuming 2 marks each
            questions: questionIds,
            positiveMark: 2,
            negativeMark: 0.5,
            type: 'practice', // New type
            isPublished: true // Private to user technically, but using published flag
        });

        res.status(201).json({
            _id: test._id,
            title: test.title,
            questionsCount: questionIds.length
        });

    } catch (error) {
        console.error('[Generate Smart Test Error]:', error);
        res.status(500).json({ message: 'Failed to generate test', error: error.message });
    }
};

module.exports = {
    createTest,
    getAllTests,
    getTestsByExam,
    getTestById,
    startTest,
    submitTest,
    getAllResults,
    getTestResult,
    getMyResults,
    updateTestResult,
    deleteTestResult,
    updateTest,
    deleteTest,
    generateSmartTest
};
