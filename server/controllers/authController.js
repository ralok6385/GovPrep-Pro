const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('../models/Exam'); // Fix: Ensure Exam model is registered for populate

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fail fast if DB not connected
        if (require('mongoose').connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database connection initializing, please try again.' });
        }

        // Only select fields needed for login — faster query, no populate
        const user = await User.findOne({ email }).select(
            '_id name email password role targetExam language avatar streak xp level badges'
        );

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password directly
        const isMatch = await require('bcryptjs').compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // ✅ Send response IMMEDIATELY — don't make the user wait for streak/save
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            targetExam: user.targetExam,
            language: user.language,
            avatar: user.avatar,
            streak: user.streak,
            xp: user.xp,
            level: user.level,
            badges: user.badges,
            token: generateToken(user._id),
        });

        // Fire background updates AFTER responding (non-blocking)
        setImmediate(async () => {
            try {
                const { updateStreak } = require('./gamificationController');
                await updateStreak(user);
                user.lastLoginDate = new Date();
                await user.save();
            } catch (bgErr) {
                console.error('[Login BG Update Error]:', bgErr.message);
            }
        });

    } catch (error) {
        console.error('[Login CRITICAL Error]:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, targetExam, language } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const targetExamSlugMap = {
            'NTPC': 'rrb-ntpc',
            'Group D': 'rrb-group-d',
            'ALP': 'rrb-alp',
            'JE': 'rrb-je'
        };

        const examSlug = targetExamSlugMap[targetExam] || 'rrb-ntpc';
        const exam = await require('../models/Exam').findOne({ slug: examSlug });

        const user = await User.create({
            name,
            email,
            password,
            phone,
            targetExam: targetExam || 'NTPC',
            language: language || 'hi',
            selectedExam: exam ? exam._id : null,
            streak: 1,
            lastActiveDate: new Date(),
            xp: 0,
            level: 1,
            badges: []
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                targetExam: user.targetExam,
                language: user.language,
                avatar: user.avatar,
                xp: user.xp,
                level: user.level,
                badges: user.badges,
                streak: user.streak,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('[Register CRITICAL Error]:', error.message);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('selectedExam');

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                targetExam: user.targetExam,
                language: user.language,
                avatar: user.avatar,
                streak: user.streak,
                xp: user.xp,
                level: user.level,
                badges: user.badges,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('[GetProfile Error]:', error.message);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// @desc    Update selected exam
// @route   PUT /api/auth/select-exam
// @access  Private
const selectExam = async (req, res) => {
    try {
        const { examId } = req.body;
        console.log(`[SelectExam] User: ${req.user._id}, ExamId: ${examId}`);

        const user = await User.findById(req.user._id);

        if (user) {
            user.selectedExam = examId;
            await user.save();

            // Return updated user
            const updatedUser = await User.findById(req.user._id).populate('selectedExam');

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                selectedExam: updatedUser.selectedExam,
                avatar: updatedUser.avatar,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('[SelectExam Error]:', error);
        res.status(500).json({ message: 'Server error updating exam preference', error: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('[GetUsers Error]:', error);
        res.status(500).json({ message: 'Server Error fetching users' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            if (req.body.targetExam) {
                user.targetExam = req.body.targetExam;
            }
            if (req.body.language) {
                user.language = req.body.language;
            }
            if (req.body.avatar !== undefined) {
                user.avatar = req.body.avatar;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                targetExam: updatedUser.targetExam,
                language: updatedUser.language,
                avatar: updatedUser.avatar,
                streak: updatedUser.streak,
                xp: updatedUser.xp,
                level: updatedUser.level,
                badges: updatedUser.badges,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('[UpdateProfile Error]:', error.message);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// @desc    Upload profile image
// @route   PUT /api/auth/profile/avatar
// @access  Private
const updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);

        if (user) {
            // Configure base URL (should be env var but using request context for now)
            const protocol = req.protocol;
            const host = req.get('host');
            const baseUrl = `${protocol}://${host}`;

            user.avatar = `${baseUrl}/${req.file.path}`; // e.g. http://localhost:5000/uploads/image-123.jpg
            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                targetExam: updatedUser.targetExam,
                language: updatedUser.language,
                avatar: updatedUser.avatar,
                streak: updatedUser.streak,
                xp: updatedUser.xp,
                level: updatedUser.level,
                badges: updatedUser.badges,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error uploading image' });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isDeleted = !user.isDeleted;
            await user.save();
            res.json({ message: `User ${user.isDeleted ? 'deactivated' : 'restored'}`, isDeleted: user.isDeleted });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('[Toggle User Status Error]:', error);
        res.status(500).json({ message: 'Server Error updating user status' });
    }
};



// In-memory OTP store (use Redis in production)
const resetOTPStore = new Map(); // email -> { otp, expiresAt, userId }

// Cleanup expired OTPs periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of resetOTPStore.entries()) {
        if (now > data.expiresAt) resetOTPStore.delete(email);
    }
}, 5 * 60 * 1000);

// @desc    Request password reset (verify identity via email + phone, send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(400).json({ message: 'Email and phone number are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim(), isDeleted: { $ne: true } });

        if (!user) {
            // Don't reveal whether email exists — generic message
            return res.status(200).json({ message: 'If this account exists, a reset code has been sent.' });
        }

        // Verify phone matches (security check)
        const storedPhone = (user.phone || '').replace(/\s/g, '').slice(-10);
        const inputPhone = phone.replace(/\s/g, '').slice(-10);

        if (!storedPhone || storedPhone !== inputPhone) {
            return res.status(400).json({ message: 'Phone number does not match our records' });
        }

        // Rate limit: prevent frequent OTP requests
        const existing = resetOTPStore.get(email.toLowerCase());
        if (existing && Date.now() - (existing.createdAt || 0) < 60000) {
            return res.status(429).json({ message: 'Please wait 60 seconds before requesting another code.' });
        }

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // Store OTP with 15-minute expiry
        resetOTPStore.set(email.toLowerCase(), {
            otp,
            userId: user._id,
            expiresAt: Date.now() + 15 * 60 * 1000,
            createdAt: Date.now(),
            attempts: 0
        });

        // In production, send OTP via email/SMS here.
        console.log(`[Password Reset OTP] Email: ${email} | OTP: ${otp}`);

        const maskedPhone = '****' + inputPhone.slice(-4);
        res.json({
            message: `A 6-digit verification code has been sent. Check your registered phone (${maskedPhone}).`,
            ...(process.env.NODE_ENV !== 'production' && { devOTP: otp })
        });
    } catch (error) {
        console.error('[Forgot Password Error]:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset password with OTP verification
// @route   POST /api/auth/reset-password
// @access  Public (with valid OTP)
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, verification code, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const storedData = resetOTPStore.get(email.toLowerCase());

        if (!storedData) {
            return res.status(400).json({ message: 'No reset request found. Please request a new code.' });
        }

        if (Date.now() > storedData.expiresAt) {
            resetOTPStore.delete(email.toLowerCase());
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        // Brute force protection: max 5 attempts
        storedData.attempts = (storedData.attempts || 0) + 1;
        if (storedData.attempts > 5) {
            resetOTPStore.delete(email.toLowerCase());
            return res.status(429).json({ message: 'Too many invalid attempts. Please request a new code.' });
        }

        if (storedData.otp !== String(otp).trim()) {
            return res.status(400).json({ message: `Invalid verification code. ${5 - storedData.attempts} attempts remaining.` });
        }

        // OTP verified — reset password
        const user = await User.findById(storedData.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        resetOTPStore.delete(email.toLowerCase());

        res.json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error) {
        console.error('[Reset Password Error]:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { authUser, registerUser, getUserProfile, selectExam, getUsers, updateUserProfile, updateProfileImage, toggleUserStatus, forgotPassword, resetPassword };
