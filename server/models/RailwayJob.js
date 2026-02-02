const mongoose = require('mongoose');

const railwayJobSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            required: true,
            maxlength: 200, // Short summary for quick reading
        },
        officialLink: {
            type: String,
            required: true, // "Trust-first" design
        },
        applicationStartDate: {
            type: Date,
            required: true,
        },
        applicationEndDate: {
            type: Date,
            required: true,
        },
        eligibility: {
            type: String, // e.g., "10th Pass", "Graduate"
            required: true,
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.RailwayJob || mongoose.model('RailwayJob', railwayJobSchema);
