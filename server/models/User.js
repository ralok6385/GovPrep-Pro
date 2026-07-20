const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true, // Faster lookups on login
        },
        avatar: {
            type: String, // URL to profile image
            default: ''
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
        },
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
        },
        targetExam: {
            type: String, // Dynamic exam name
            default: ''
        },
        language: {
            type: String,
            enum: ['hi', 'en'],
            default: 'hi' // Hindi-first
        },
        selectedExam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam'
        },
        streak: {
            type: Number,
            default: 0
        },
        lastActiveDate: {
            type: Date
        },
        xp: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 1
        },
        badges: [{
            type: String
        }],
        lastLoginDate: {
            type: Date
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    // SECURITY: OWASP recommends bcrypt cost factor >= 12.
    // Factor 12 adds ~100ms per hash on a free-tier server, which is acceptable
    // for an auth endpoint and makes offline brute-force attacks ~16x harder than factor 8.
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Add Indexes for Performance
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
