const mongoose = require('mongoose');

// Global cached connection for hot-reloads
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// Rate-limit disconnect logs to avoid console flooding
let lastDisconnectLog = 0;
let disconnectCount = 0;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000; // Max 30s between retries

const connectDB = async () => {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            heartbeatFrequencyMS: 10000,    // Check connection health every 10s
            retryWrites: true,
            retryReads: true,
        };

        console.log('⏳ Connecting to MongoDB...');
        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongooseInstance) => {
            console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
            reconnectAttempts = 0; // Reset on successful connection
            return mongooseInstance;
        }).catch(err => {
            console.error(`❌ MongoDB Connection Error: ${err.message}`);
            cached.promise = null;
            cached.conn = null;
            // Exponential backoff: 2s, 4s, 8s, 16s, max 30s
            const delay = Math.min(2000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
            reconnectAttempts++;
            console.log(`🔄 Retrying MongoDB connection in ${delay / 1000}s (attempt ${reconnectAttempts})...`);
            setTimeout(connectDB, delay);
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        cached.conn = null;
        throw e;
    }

    return cached.conn;
};

// --- Connection Event Handlers ---

mongoose.connection.on('connected', () => {
    disconnectCount = 0;
    reconnectAttempts = 0;
    console.log('✅ MongoDB connection established');
});

mongoose.connection.on('reconnected', () => {
    disconnectCount = 0;
    reconnectAttempts = 0;
    console.log('🔄 MongoDB reconnected successfully!');
});

mongoose.connection.on('disconnected', () => {
    disconnectCount++;
    const now = Date.now();
    // Only log once every 30 seconds to prevent console flooding
    if (now - lastDisconnectLog > 30000) {
        console.warn(`⚠️ MongoDB disconnected! (${disconnectCount} events since last log)`);
        lastDisconnectLog = now;
        disconnectCount = 0;
    }

    // Auto-reconnect: reset cached promise so next request triggers a reconnect
    cached.promise = null;
    cached.conn = null;

    // Proactively attempt reconnection
    const delay = Math.min(3000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
    reconnectAttempts++;
    setTimeout(() => {
        if (mongoose.connection.readyState === 0) {
            console.log(`🔄 Auto-reconnecting to MongoDB (attempt ${reconnectAttempts})...`);
            connectDB().catch(() => {}); // Swallow error — retry logic handles it
        }
    }, delay);
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

module.exports = connectDB;
