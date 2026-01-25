const mongoose = require('mongoose');

const testSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
        },
        durationMinutes: {
            type: Number,
            required: true,
        },
        totalMarks: {
            type: Number,
            required: true,
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            },
        ],
        positiveMark: {
            type: Number,
            default: 1,
        },
        negativeMark: {
            type: Number,
            default: 0.25,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
