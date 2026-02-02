const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema(
    {
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: false, // Changed to false to allow "Global/Common" subjects
        },
        name: {
            type: String,
            required: true, // e.g., "Quantitative Aptitude"
        },
        slug: {
            type: String,
            required: true,
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

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

module.exports = Subject;
