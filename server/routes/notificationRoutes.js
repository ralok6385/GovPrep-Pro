const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getMyNotifications, markAsRead, markAllRead, sendNotification } = require('../controllers/notificationController');

router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markAsRead);
router.post('/send', protect, admin, sendNotification);

module.exports = router;
