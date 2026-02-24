const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
    try {
        const [notes, unreadCount] = await Promise.all([
            Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20).lean(),
            Notification.countDocuments({ user: req.user._id, isRead: false })
        ]);

        res.json({
            notifications: notes,
            unreadCount
        });
    } catch (error) {
        console.error("getMyNotifications Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark as Read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const note = await Notification.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Not found' });

        if (note.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: 'Not authorized' });

        note.isRead = true;
        await note.save();
        res.json(note);
    } catch (error) {
        console.error("markAsRead Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send Notification (Admin)
// @route   POST /api/notifications/send
// @access  Private/Admin
const sendNotification = async (req, res) => {
    try {
        const { title, message, type, audience, userId } = req.body;
        // audience: 'all', 'inactive', 'single'

        let targetUserIds = [];

        if (audience === 'single' && userId) {
            targetUserIds = [userId];
        } else if (audience === 'all') {
            const users = await User.find({ role: 'student' }).select('_id');
            targetUserIds = users.map(u => u._id);
        } else if (audience === 'inactive') {
            // Inactive > 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const users = await User.find({
                role: 'student',
                $or: [
                    { lastLoginDate: { $lt: sevenDaysAgo } },
                    { lastLoginDate: { $exists: false } }
                ]
            }).select('_id');
            targetUserIds = users.map(u => u._id);
        }

        console.log(`[Notification] Sending to ${targetUserIds.length} users...`);

        // Batch Insert
        const notifications = targetUserIds.map(uid => ({
            user: uid,
            title,
            message,
            type: type || 'info'
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.json({ message: `Sent to ${targetUserIds.length} users`, count: targetUserIds.length });

    } catch (error) {
        console.error("sendNotification Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark All as Read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error("markAllRead Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getMyNotifications, markAsRead, markAllRead, sendNotification };
