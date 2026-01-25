const Test = require('../models/Test');
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private/Admin
const createTest = async (req, res) => {
    const {
        title,
        examId,
        durationMinutes,
        totalMarks,
        questions, // Array of Question IDs
        positiveMark,
        negativeMark,
    } = req.body;

    const test = await Test.create({
        title,
        examId,
        durationMinutes,
        totalMarks,
        questions,
        positiveMark,
        negativeMark,
        isPublished: true,
    });

    res.status(201).json(test);
};

// @desc    Get all tests for an exam
// @route   GET /api/tests/exam/:examId
// @access  Private (Student)
const getTestsByExam = async (req, res) => {
    const tests = await Test.find({
        examId: req.params.examId,
        isPublished: true,
    }).select('-questions'); // Don't send questions list in summary
    res.json(tests);
};

// @desc    Start test (Get questions without answers)
// @route   GET /api/tests/:id/start
// @access  Private (Student)
const startTest = async (req, res) => {
    const test = await Test.findById(req.params.id).populate('questions');

    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    // Security: Remove correctOption from questions
    const sanitizedQuestions = test.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        options: q.options,
        // NO correctOption
        // NO explanation
    }));

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
    const { responses } = req.body; // [{ questionId, selectedOption, timeTaken }]
    const test = await Test.findById(req.params.id).populate('questions');

    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;

    const processedResponses = responses.map((resp) => {
        const question = test.questions.find(
            (q) => q._id.toString() === resp.questionId
        );

        let isCorrect = false;
        if (question && resp.selectedOption === question.correctOption) {
            isCorrect = true;
            score += test.positiveMark;
            correctCount++;
        } else if (question && resp.selectedOption) {
            // Attempted but wrong
            score -= test.negativeMark;
            wrongCount++;
        }

        return {
            questionId: resp.questionId,
            selectedOption: resp.selectedOption,
            correctOption: question ? question.correctOption : null,
            isCorrect,
            timeTakenSeconds: resp.timeTakenSeconds,
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
    });

    res.json(result);
};

module.exports = { createTest, getTestsByExam, startTest, submitTest };
