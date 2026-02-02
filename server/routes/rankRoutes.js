const express = require('express');
const router = express.Router();
const { getMyRank, getLeaderboard } = require('../controllers/rankController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-rank', protect, getMyRank);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
