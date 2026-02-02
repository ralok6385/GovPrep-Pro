const Content = require('../models/Content');

// @desc    Get content for a subject
// @route   GET /api/content/:subjectId
// @access  Private (Needs to be logged in)
// getattr removed as it caused a crash and was unused

// @desc    Get content with filters
// @route   GET /api/content?subjectId=...&type=...
// @access  Private
const getContent = async (req, res) => {
    try {
        const { subjectId, type } = req.query;
        const query = {};

        if (subjectId) {
            query.subjectId = subjectId;
        }

        if (type && type !== 'all') {
            query.type = type;
        }

        const content = await Content.find(query).populate('subjectId', 'name');
        res.json(content);
    } catch (error) {
        console.error('[GetContent Error]:', error);
        // Fallback to empty array to prevent dashboard crash
        res.json([]);
    }
};

// @desc    Upload new content
// @route   POST /api/content
// @access  Private/Admin
const createContent = async (req, res) => {
    try {
        const { title, type, url, subjectId, topicName, isPremium } = req.body;

        // Use uploaded file path if available, otherwise use provided URL
        const contentUrl = req.file ? `/${req.file.path}` : url;

        const content = await Content.create({
            title,
            type,
            url: contentUrl,
            subjectId,
            topicName,
            isPremium: isPremium === 'true' || isPremium === true, // Handle string/boolean logic often needed with FormData
        });

        res.status(201).json(content);
    } catch (error) {
        console.error('[CreateContent Error]:', error);
        res.status(500).json({ message: 'Server Error creating content' });
    }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private/Admin
const deleteContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        await content.deleteOne();
        res.json({ message: 'Content removed' });
    } catch (error) {
        console.error('[DeleteContent Error]:', error);
        res.status(500).json({ message: 'Server Error deleting content' });
    }
};

module.exports = { getContent, createContent, deleteContent };
