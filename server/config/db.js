const mongoose = require('mongoose');

// Global cached connection for hot-reloads
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        // console.log('✅ Using existing MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Maintain a pool of 10 connections
        };

        console.log('⏳ Connecting to MongoDB...');
        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
            console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        }).catch(err => {
            console.error(`❌ MongoDB Connection Error: ${err.message}`);
            cached.promise = null; // Reset promise on failure
            // Retry logic
            setTimeout(connectDB, 5000);
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected!');
});

module.exports = connectDB;
