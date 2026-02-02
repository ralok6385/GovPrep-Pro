const express = require('express');
const router = express.Router();
const { getContent, createContent, deleteContent } = require('../controllers/contentController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, admin, upload.single('file'), createContent)
    .get(protect, getContent);

router.route('/:id').delete(protect, admin, deleteContent);

module.exports = router;
