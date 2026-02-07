const mongoose = require('mongoose');

const questionSchema = mongoose.Schema(
    {
        text: {
            type: String,
            required: true, // HTML supported In English
        },
        textHindi: {
            type: String, // Optional Hindi Text
        },
        options: [
            {
                id: { type: String, required: true }, // "A", "B", "C", "D"
                text: { type: String, required: true },
                textHindi: { type: String }, // Optional Hindi Option
            },
        ],
        correctOption: {
            type: String,
            required: true, // "B"
        },
        explanation: {
            type: String,
        },
        explanationHindi: {
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

// Add Indexes for Performance
questionSchema.index({ subjectId: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ subjectId: 1, difficulty: 1 }); // Compond for random sampling

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

module.exports = Question;
