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
        console.log(`[Login Attempt] Email: ${email}`);

        // Fail fast if DB not connected
        if (require('mongoose').connection.readyState !== 1) {
            console.error('[Login Error] DB not ready');
            return res.status(503).json({ message: 'Database connection initializing, please try again.' });
        }

        const user = await User.findOne({ email }).populate('selectedExam');
        console.log(`[Login Step] User found: ${!!user}`);

        if (user && (await user.matchPassword(password))) {
            console.log('[Login Step] Password Matched');

            // Streak Calculation (Centralized)
            try {
                const { updateStreak } = require('./gamificationController');
                await updateStreak(user);
            } catch (streakError) {
                console.error('[Login Error] Streak Calculation Failed:', streakError);
            }

            user.lastLoginDate = new Date();
            await user.save();
            console.log('[Login Step] User Saved');

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
        } else {
            console.warn('[Login Failure] Invalid credentials');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('[Login CRITICAL Error]:', error);
        console.error(error.stack);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
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
        targetExam: targetExam || 'NTPC', // Default
        language: language || 'hi', // Default Hindi
        selectedExam: exam ? exam._id : null,
        streak: 1, // Start with 1 day streak
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
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
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
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
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

module.exports = { authUser, registerUser, getUserProfile, selectExam, getUsers, updateUserProfile, updateProfileImage, toggleUserStatus };

