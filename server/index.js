const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
// Socket.io with permissive CORS
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(compression()); // Gzip all responses (~70% size reduction)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Production-grade CORS — allow Vercel + local dev
const ALLOWED_ORIGINS = [
    'https://gov-prep-pro.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Render health pings)
        if (!origin) return callback(null, true);
        // Allow any Vercel preview URL for this project
        if (
            ALLOWED_ORIGINS.includes(origin) ||
            origin.endsWith('.vercel.app')
        ) {
            return callback(null, true);
        }
        // In production, reject unknown origins. In dev, allow all.
        if (process.env.NODE_ENV === 'production') {
            return callback(new Error(`CORS: origin ${origin} not allowed`), false);
        }
        callback(null, true); // Dev-mode fallback
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// --- RATE LIMITING ---
// General API rate limit: 300 requests per 15 minutes per IP
// (Dashboard alone makes 5-10 calls per page load, so 100 was too tight)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict auth rate limit: prevents brute force on login/signup
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 login attempts per 15 minutes
    message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 signups per hour per IP
    message: { message: 'Too many accounts created. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// AI generation limiter (expensive operation)
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'AI generation limit reached. Please wait.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general limiter to all /api routes
app.use('/api/', generalLimiter);

// Handle OPTIONS preflight — Express 5 requires explicit wildcard syntax
app.options('/{*path}', cors());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d', // Cache static uploads for 7 days
    immutable: true
}));

// Socket connection logic
const { findMatch, submitAnswer, handleDisconnect } = require('./controllers/battleController');

let socketConnections = 0;
io.on('connection', (socket) => {
    socketConnections++;
    // Only log every 5th connection to reduce noise
    if (socketConnections % 5 === 1) {
        console.log(`[Socket] Active connections: ~${io.engine.clientsCount || socketConnections}`);
    }

    // Dashboard Notifications
    socket.on('join_dashboard', (userId) => {
        socket.join(`user_${userId}`);
    });

    // --- BATTLE MODE EVENTS ---
    socket.on('find_match', (userData) => {
        findMatch(io, socket, userData);
    });

    socket.on('submit_answer', (data) => {
        submitAnswer(io, socket, data);
    });

    socket.on('disconnect', () => {
        handleDisconnect(socket);
    });
});

// Pass io to request object for use in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: state === 1 ? 'ok' : 'error',
        dbState: states[state] || 'unknown'
    });
});

// Routes — with targeted rate limiters for sensitive endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', signupLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/ai', aiLimiter);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/ranks', require('./routes/rankRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));

// --- GLOBAL ERROR HANDLER (must be after all routes) ---
// Catches any errors thrown in route handlers that aren't caught by try-catch
app.use((err, req, res, next) => {
    console.error('[Global Error Handler]:', err.message);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// --- PROCESS ERROR HANDLERS (prevent total server crash) ---
process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT EXCEPTION]:', err.message);
    console.error(err.stack);
    // Don't exit — let the server keep running for other requests
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION]:', reason);
    // Don't exit — let the server keep running
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);

        // --- KEEP-ALIVE PING (Prevents Render free tier from sleeping) ---
        if (process.env.NODE_ENV === 'production') {
            const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
            setInterval(async () => {
                try {
                    const https = require('https');
                    const http = require('http');
                    const client = SELF_URL.startsWith('https') ? https : http;
                    client.get(`${SELF_URL}/api/health`, (res) => {
                        console.log(`[Keep-Alive] Pinged self. Status: ${res.statusCode}`);
                    }).on('error', (e) => {
                        console.warn(`[Keep-Alive] Ping failed: ${e.message}`);
                    });
                } catch (e) {
                    console.warn('[Keep-Alive] Ping error:', e.message);
                }
            }, 14 * 60 * 1000);
            console.log('[Keep-Alive] Self-ping scheduler started (every 14 minutes)');
        }
    });
}

module.exports = { app, server };
