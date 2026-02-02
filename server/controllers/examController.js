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
    const { examId } = req.params;
    let query = {
        $or: [
            { examId: null },
            { examId: { $exists: false } } // Always include globals
        ]
    };

    // If valid Exam ObjectId provided, include it
    if (examId && examId.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.unshift({ examId: examId });
    }

    try {
        const subjects = await Subject.find(query).sort({ createdAt: 1 });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects' });
    }
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

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        await exam.deleteOne();
        res.json({ message: 'Exam removed' });
    } catch (error) {
        console.error('[DeleteExam Error]:', error);
        res.status(500).json({ message: 'Server Error deleting exam' });
    }
};

module.exports = { getExams, createExam, getSubjects, createSubject, deleteExam };
