const Question = require('../models/Question');

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
    const {
        text,
        options,
        correctOption,
        explanation,
        subjectId,
        difficulty,
    } = req.body;

    const question = await Question.create({
        text,
        options,
        correctOption,
        explanation,
        subjectId,
        difficulty,
    });

    res.status(201).json(question);
};

// @desc    Get questions by subject (for Admin browsing)
// @route   GET /api/questions/subject/:subjectId
// @access  Private/Admin
const getQuestionsBySubject = async (req, res) => {
    const questions = await Question.find({ subjectId: req.params.subjectId });
    res.json(questions);
};

module.exports = { createQuestion, getQuestionsBySubject };
