const mongoose = require('mongoose');

const questionSchema = mongoose.Schema(
    {
        text: {
            type: String,
            required: true, // HTML supported
        },
        options: [
            {
                id: { type: String, required: true }, // "A", "B", "C", "D"
                text: { type: String, required: true },
            },
        ],
        correctOption: {
            type: String,
            required: true, // "B"
        },
        explanation: {
            type: String,
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
