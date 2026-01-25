const express = require('express');
const router = express.Router();
const {
    createTest,
    getTestsByExam,
    startTest,
    submitTest,
} = require('../controllers/testController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createTest);
router.route('/exam/:examId').get(protect, getTestsByExam);
router.route('/:id/start').get(protect, startTest);
router.route('/:id/submit').post(protect, submitTest);

module.exports = router;
