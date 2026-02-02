const mongoose = require('mongoose');

const examSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // e.g., "SSC CGL"
        },
        slug: {
            type: String, // e.g., "ssc-cgl"
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);

module.exports = Exam;
