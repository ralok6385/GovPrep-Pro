const express = require('express');
const router = express.Router();
const {
    getExams,
    createExam,
    getSubjects,
    createSubject,
} = require('../controllers/examController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getExams).post(protect, admin, createExam);
router.route('/subjects').post(protect, admin, createSubject);
router.route('/:examId/subjects').get(getSubjects);

module.exports = router;
