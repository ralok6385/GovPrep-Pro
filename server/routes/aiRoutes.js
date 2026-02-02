const express = require('express');
const router = express.Router();
const { generateQuestions, translateContent } = require('../controllers/aiController');
const { explainQuestion } = require('../controllers/aiTutorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/generate', protect, admin, generateQuestions);
router.post('/translate', protect, admin, translateContent);
router.post('/explain', protect, explainQuestion); // Student accessible

module.exports = router;
