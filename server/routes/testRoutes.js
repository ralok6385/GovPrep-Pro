const express = require('express');
const router = express.Router();
const {
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
    deleteTest
} = require('../controllers/testController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createTest).get(protect, getAllTests);
router.post('/generate', protect, require('../controllers/testController').generateSmartTest);
router.get('/results/all', protect, admin, getAllResults);
router.get('/results/me', protect, getMyResults);
router.route('/results/:id')
    .get(protect, getTestResult)
    .put(protect, admin, updateTestResult)
    .delete(protect, admin, deleteTestResult);

router.route('/exam/:examId').get(protect, getTestsByExam);
router.route('/:id')
    .get(protect, getTestById)
    .put(protect, admin, updateTest)
    .delete(protect, admin, deleteTest);
router.route('/:id/start').get(protect, startTest);
router.route('/:id/submit').post(protect, submitTest);

module.exports = router;
