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
    getQuestionsByIds
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createQuestion).get(protect, admin, getQuestions);
router.route('/bulk').post(protect, admin, bulkCreateQuestions);
router.post('/batch', protect, getQuestionsByIds); // Allow students to fetch questions
router.route('/subject/:subjectId').get(protect, admin, getQuestionsBySubject);
router.route('/:id').get(protect, getQuestionById).delete(protect, admin, deleteQuestion).put(protect, admin, updateQuestion);

module.exports = router;
