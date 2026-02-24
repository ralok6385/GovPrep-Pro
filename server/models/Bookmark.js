const mongoose = require('mongoose');

const bookmarkSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        },
        note: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// One bookmark per user-question pair
bookmarkSchema.index({ user: 1, question: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });

const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
