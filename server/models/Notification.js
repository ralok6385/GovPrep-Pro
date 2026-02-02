const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Null means "Global Broadcast"
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String, // info, success, warning, alert
            default: 'info'
        },
        isRead: {
            type: Boolean,
            default: false
        },
        data: {
            type: Object, // Optional payload (link, testId, etc)
            default: {}
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
