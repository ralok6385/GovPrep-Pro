const express = require('express');
const router = express.Router();
const { getContent, createContent } = require('../controllers/contentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createContent);
router.route('/:subjectId').get(protect, getContent);

module.exports = router;
