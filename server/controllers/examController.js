const Exam = require('../models/Exam');
const Subject = require('../models/Subject');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Public
const getExams = async (req, res) => {
    const exams = await Exam.find({ isActive: true });
    res.json(exams);
};

// @desc    Create an exam
// @route   POST /api/exams
// @access  Private/Admin
const createExam = async (req, res) => {
    const { name, slug, description } = req.body;

    const examExists = await Exam.findOne({ slug });
    if (examExists) {
        return res.status(400).json({ message: 'Exam already exists' });
    }

    const exam = await Exam.create({
        name,
        slug,
        description,
    });

    res.status(201).json(exam);
};

// @desc    Get subjects for an exam
// @route   GET /api/exams/:examId/subjects
// @access  Public
const getSubjects = async (req, res) => {
    const subjects = await Subject.find({ examId: req.params.examId }).sort({ createdAt: 1 });
    res.json(subjects);
};

// @desc    Create a subject
// @route   POST /api/exams/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    const { examId, name, topics } = req.body;

    const subject = await Subject.create({
        examId,
        name,
        topics,
    });

    res.status(201).json(subject);
};

module.exports = { getExams, createExam, getSubjects, createSubject };
