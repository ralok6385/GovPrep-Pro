const express = require('express');
const router = express.Router();
const {
    createQuestion,
    bulkCreateQuestions,
    getQuestionsBySubject,
    getQuestions,
    getQuestionById,
    deleteQuestion,
    updateQuestion,
    getQuestionsByIds,
    getPracticeQuestions,
    getTopicsForSubject,
    getPYQQuestions
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Student-facing practice & PYQ routes (must be ABOVE /:id to avoid route conflicts)
router.get('/practice', protect, getPracticeQuestions);
router.get('/topics', protect, getTopicsForSubject);
router.get('/pyq', protect, getPYQQuestions);

router.route('/').post(protect, admin, createQuestion).get(protect, admin, getQuestions);
router.route('/bulk').post(protect, admin, bulkCreateQuestions);
router.post('/batch', protect, getQuestionsByIds); // Allow students to fetch questions
router.route('/subject/:subjectId').get(protect, admin, getQuestionsBySubject);
router.route('/:id').get(protect, getQuestionById).delete(protect, admin, deleteQuestion).put(protect, admin, updateQuestion);

module.exports = router;
