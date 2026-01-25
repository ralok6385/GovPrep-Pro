const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getQuestionsBySubject,
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createQuestion);
router.route('/subject/:subjectId').get(protect, admin, getQuestionsBySubject);

module.exports = router;
