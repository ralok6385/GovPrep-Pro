const express = require('express');
const router = express.Router();
const { getDashboardStats, getStudentAnalytics, getWeaknessAnalysis } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/student', protect, getStudentAnalytics);
router.get('/weakness-analysis', protect, getWeaknessAnalysis);

module.exports = router;
