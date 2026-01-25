const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            selectedExam: user.selectedExam,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
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
            selectedExam: user.selectedExam,
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
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('[SelectExam Error]:', error);
        res.status(500).json({ message: 'Server error updating exam preference', error: error.message });
    }
};

module.exports = { authUser, registerUser, getUserProfile, selectExam };

