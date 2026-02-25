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
    // Rounds 8 is safe and ~4x faster than 10 on low-CPU environments (Render free tier)
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
});

// Add Indexes for Performance
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
