const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { toggleBookmark, getMyBookmarks, checkBookmarks } = require('../controllers/bookmarkController');

router.get('/', protect, getMyBookmarks);
router.post('/toggle', protect, toggleBookmark);
router.post('/check', protect, checkBookmarks);

module.exports = router;
