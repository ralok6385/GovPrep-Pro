const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema(
    {
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
        },
        name: {
            type: String,
            required: true, // e.g., "Quantitative Aptitude"
        },
        topics: [
            {
                name: { type: String, required: true }, // e.g., "Algebra"
                order: Number,
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
