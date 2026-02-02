const RailwayJob = require('../models/RailwayJob');

// @desc    Get all active railway jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    try {
        const jobs = await RailwayJob.find({}).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching jobs' });
    }
};

// @desc    Create a job posting
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = async (req, res) => {
    const { title, summary, officialLink, applicationStartDate, applicationEndDate, eligibility } = req.body;

    try {
        const job = await RailwayJob.create({
            title,
            summary,
            officialLink,
            applicationStartDate,
            applicationEndDate,
            eligibility,
            postedBy: req.user._id
        });
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server Error creating job', error: error.message });
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = async (req, res) => {
    try {
        const job = await RailwayJob.findById(req.params.id);
        if (job) {
            await job.deleteOne();
            res.json({ message: 'Job removed' });
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting job' });
    }
};

module.exports = { getJobs, createJob, deleteJob };
