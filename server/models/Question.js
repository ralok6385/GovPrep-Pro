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
        // Topic within a subject (e.g., "Percentage", "Calendar", "Indian Polity")
        topic: {
            type: String,
            trim: true,
            default: 'General',
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        // PYQ (Previous Year Question) fields
        year: {
            type: Number, // e.g., 2023
        },
        source: {
            type: String, // e.g., "RRB NTPC 2023 Phase 4", "SSC CGL 2022 Tier 1"
            trim: true,
        },
        // Tags for better categorization
        tags: [{
            type: String,
            trim: true,
        }],
    },
    {
        timestamps: true,
    }
);

// Add Indexes for Performance
questionSchema.index({ subjectId: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ subjectId: 1, difficulty: 1 }); // Compound for random sampling
questionSchema.index({ topic: 1 }); // Topic-wise queries
questionSchema.index({ subjectId: 1, topic: 1 }); // Subject + Topic combo
questionSchema.index({ year: -1 }); // PYQ by year
questionSchema.index({ source: 1 }); // PYQ by source exam
questionSchema.index({ subjectId: 1, topic: 1, difficulty: 1 }); // Practice mode filter

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

module.exports = Question;
