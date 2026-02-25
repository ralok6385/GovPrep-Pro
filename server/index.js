const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
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
        callback(null, true); // Permissive fallback — tighten in production if needed
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Handle OPTIONS preflight — Express 5 requires explicit wildcard syntax
app.options('/{*path}', cors());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d', // Cache static uploads for 7 days
    immutable: true
}));

// Socket connection logic
const { findMatch, submitAnswer, handleDisconnect } = require('./controllers/battleController');

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Dashboard Notifications
    socket.on('join_dashboard', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their notification room`);
    });

    // --- BATTLE MODE EVENTS ---
    socket.on('find_match', (userData) => {
        findMatch(io, socket, userData);
    });

    socket.on('submit_answer', (data) => {
        submitAnswer(io, socket, data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
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

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/ranks', require('./routes/rankRoutes')); // [NEW]
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);

        // --- KEEP-ALIVE PING (Prevents Render free tier from sleeping) ---
        // Render spins down free instances after 15 minutes of inactivity.
        // This self-ping runs every 14 minutes to keep the server permanently awake.
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
            }, 14 * 60 * 1000); // Every 14 minutes
            console.log('[Keep-Alive] Self-ping scheduler started (every 14 minutes)');
        }
    });
}

module.exports = { app, server };
