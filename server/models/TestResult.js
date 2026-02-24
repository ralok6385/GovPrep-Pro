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
        tabSwitchWarnings: {
            type: Number,
            default: 0,
        },
        isAutoSubmitted: {
            type: Boolean,
            default: false,
        },
        rank: {
            type: Number,
        },
        totalParticipants: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

// Add Indexes for Performance
testResultSchema.index({ studentId: 1 });
testResultSchema.index({ testId: 1 });
testResultSchema.index({ score: -1 });
testResultSchema.index({ testId: 1, score: -1 }); // For Leaderboards
testResultSchema.index({ studentId: 1, createdAt: -1 }); // For student history
testResultSchema.index({ createdAt: -1 }); // For recent results

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;
