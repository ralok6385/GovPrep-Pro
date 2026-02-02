const Subject = require('../models/Subject');

// @desc    Get all subjects or filter by exam
// @route   GET /api/subjects?examId=...
// @access  Public (or Private)
const getSubjects = async (req, res) => {
    try {
        const { examId, all } = req.query;
        console.log('[GetSubjects] Query ExamId:', examId, 'All:', all);

        const query = {};
        if (examId) {
            // Fetch subjects for this exam OR global subjects (no examId)
            query.$or = [{ examId: examId }, { examId: null }, { examId: { $exists: false } }];
        } else if (all) {
            // Fetch all subjects (Admin Subjects List)
            console.log('[GetSubjects] Fetching ALL subjects');
        } else {
            // Safety: If no examId and not asking for all, return empty to prevent duplicates/confusion
            console.log('[GetSubjects] No examId provided and all!=true. Returning empty.');
            return res.json([]);
        }

        const subjects = await Subject.find(query).populate('examId', 'name');
        res.json(subjects);
    } catch (error) {
        console.error('[GetSubjects Error] Crashed:', error);
        // Fallback to empty array to prevent dashboard crash
        res.json([]);
    }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    try {
        const { name, examId, icon } = req.body;

        // Generate simple slug
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const subject = await Subject.create({
            name,
            slug,
            examId: examId === '' ? null : examId,
            icon: icon || 'BookOpen' // Default icon
        });

        res.status(201).json(subject);
    } catch (error) {
        console.error('[CreateSubject Error]:', error);
        res.status(500).json({ message: 'Server Error creating subject' });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[DeleteSubject] Request to delete ID:', id);

        // Validate ID format (avoid CastError)
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('[DeleteSubject] Invalid ID format:', id);
            return res.status(400).json({ message: 'Invalid Subject ID format' });
        }

        const subject = await Subject.findById(id);

        if (!subject) {
            console.log('[DeleteSubject] Subject not found for ID:', id);
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Use deleteOne on the model with the query
        await Subject.deleteOne({ _id: id });
        console.log('[DeleteSubject] Successfully deleted:', id);

        res.json({ message: 'Subject removed' });
    } catch (error) {
        console.error('[DeleteSubject Error]:', error);
        res.status(500).json({ message: 'Server Error deleting subject: ' + error.message });
    }
};

module.exports = { getSubjects, createSubject, deleteSubject };
