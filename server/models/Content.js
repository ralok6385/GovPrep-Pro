const mongoose = require('mongoose');

const contentSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['video', 'pdf', 'image'],
            required: true,
        },
        url: {
            type: String,
            required: true, // Storage link or YouTube link
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },
        topicName: {
            type: String,
            required: true,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Content = mongoose.models.Content || mongoose.model('Content', contentSchema);

module.exports = Content;
