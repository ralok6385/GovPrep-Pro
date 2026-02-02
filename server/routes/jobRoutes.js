const express = require('express');
const router = express.Router();
const { getJobs, createJob, deleteJob } = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getJobs).post(protect, admin, createJob);
router.route('/:id').delete(protect, admin, deleteJob);

module.exports = router;
