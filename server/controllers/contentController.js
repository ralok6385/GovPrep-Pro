const Content = require('../models/Content');

// @desc    Get content for a subject
// @route   GET /api/content/:subjectId
// @access  Private (Needs to be logged in)
const getContent = async (req, res) => {
    const content = await Content.find({ subjectId: req.params.subjectId });
    res.json(content);
};

// @desc    Upload new content
// @route   POST /api/content
// @access  Private/Admin
const createContent = async (req, res) => {
    const { title, type, url, subjectId, topicName } = req.body;

    const content = await Content.create({
        title,
        type,
        url,
        subjectId,
        topicName,
    });

    res.status(201).json(content);
};

module.exports = { getContent, createContent };
