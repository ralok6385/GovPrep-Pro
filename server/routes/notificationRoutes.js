const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getMyNotifications, markAsRead, sendNotification } = require('../controllers/notificationController');

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/send', protect, admin, sendNotification);

module.exports = router;
