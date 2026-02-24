const Bookmark = require('../models/Bookmark');

// @desc    Toggle bookmark on a question
// @route   POST /api/bookmarks/toggle
// @access  Private
const toggleBookmark = async (req, res) => {
    try {
        const { questionId } = req.body;

        if (!questionId) {
            return res.status(400).json({ message: 'questionId is required' });
        }

        const existing = await Bookmark.findOne({
            user: req.user._id,
            question: questionId,
        });

        if (existing) {
            await Bookmark.deleteOne({ _id: existing._id });
            return res.json({ bookmarked: false, message: 'Bookmark removed' });
        }

        await Bookmark.create({
            user: req.user._id,
            question: questionId,
        });

        return res.status(201).json({ bookmarked: true, message: 'Question bookmarked' });
    } catch (error) {
        console.error('Toggle Bookmark Error:', error);
        res.status(500).json({ message: 'Failed to toggle bookmark' });
    }
};

// @desc    Get all bookmarked questions for the user
// @route   GET /api/bookmarks
// @access  Private
const getMyBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user._id })
            .populate({
                path: 'question',
                populate: { path: 'subjectId', select: 'name' },
            })
            .sort({ createdAt: -1 })
            .lean();

        res.json(bookmarks);
    } catch (error) {
        console.error('Get Bookmarks Error:', error);
        res.status(500).json({ message: 'Failed to fetch bookmarks' });
    }
};

// @desc    Check if a list of questions are bookmarked
// @route   POST /api/bookmarks/check
// @access  Private
const checkBookmarks = async (req, res) => {
    try {
        const { questionIds } = req.body;

        if (!questionIds || !Array.isArray(questionIds)) {
            return res.status(400).json({ message: 'questionIds array is required' });
        }

        const bookmarks = await Bookmark.find({
            user: req.user._id,
            question: { $in: questionIds },
        }).select('question').lean();

        const bookmarkedIds = bookmarks.map(b => b.question.toString());
        res.json({ bookmarkedIds });
    } catch (error) {
        console.error('Check Bookmarks Error:', error);
        res.status(500).json({ message: 'Failed to check bookmarks' });
    }
};

module.exports = { toggleBookmark, getMyBookmarks, checkBookmarks };
