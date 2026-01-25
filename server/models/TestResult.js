const mongoose = require('mongoose');

const testResultSchema = mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Test',
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        accuracy: {
            type: Number, // Percentage
        },
        responses: [
            {
                questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
                selectedOption: { type: String }, // User's answer
                correctOption: { type: String }, // For easier parsing later, or fetch from Q
                isCorrect: { type: Boolean },
                timeTakenSeconds: { type: Number },
            },
        ],
        completedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;
