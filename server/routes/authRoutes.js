const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    selectExam,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getUserProfile);
router.put('/select-exam', protect, selectExam);

module.exports = router;
