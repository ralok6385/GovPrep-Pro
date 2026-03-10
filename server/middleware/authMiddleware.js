const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (mongoose.connection.readyState !== 1) {
                console.warn('[Auth] DB not connected. State:', mongoose.connection.readyState);
                return res.status(503).json({ message: 'Service unavailable, database reconnecting...' });
            }

            req.user = await User.findById(decoded.id).select('-password').lean();

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(`[Auth Middleware Error] Path: ${req.path} | Error: ${error.message}`);
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token failed or expired' });
            }
            // Return 503 if it's a timeout/connection error, otherwise 500
            const status = error.message.includes('buffering timed out') || error.message.includes('topology') ? 503 : 500;
            return res.status(status).json({ message: 'Server error during authentication', error: error.message });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
