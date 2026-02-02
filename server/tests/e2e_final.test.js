import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';

// Dynamic imports or require for CJS modules if needed, but standard import often works with Vitest auto-interop.
// However, since the server is CJS, we might need to use createRequire or just rely on Vitest.
// Let's try standard imports first.

// We need to import the CJS module.
import { app, server } from '../index.js'; // Assuming index.js handles CJS export

// Models
import User from '../models/User.js';
import RailwayJob from '../models/RailwayJob.js';
import Notification from '../models/Notification.js';

describe('Final E2E Verification', () => {
    let adminToken;
    let studentToken;
    let studentId;
    let jobId;

    beforeAll(async () => {
        // Poll for DB connection
        let retries = 10;
        while (mongoose.connection.readyState !== 1 && retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retries--;
        }

        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        console.log('Test DB Connection State:', mongoose.connection.readyState);
    });

    afterAll(async () => {
        if (jobId) {
            await RailwayJob.findByIdAndDelete(jobId);
        }
        // Cleanup notifications created during test
        await Notification.deleteMany({ title: 'E2E Test Broadcast' });

        // Close DB connection
        await mongoose.connection.close();
        // Close Server
        if (server) server.close();
    });

    it('should login as Admin', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'lalanjeelalan@gmail.com',
                password: 'admin'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.role).toBe('admin');
        adminToken = res.body.token;
    });

    it('should create a Job Posting (Fix Verification)', async () => {
        const payload = {
            title: "E2E Verified Job",
            summary: "Job created by automated test",
            officialLink: "https://example.com",
            applicationStartDate: "2024-11-01",
            applicationEndDate: "2024-11-30",
            eligibility: "Graduate"
        };

        const res = await request(app)
            .post('/api/jobs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(payload);

        // If this fails with 500, we'll see the error in logs (due to my added console.logs)
        if (res.statusCode !== 201) {
            console.error('Job Creation Failed:', res.body);
        }
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe(payload.title);
        jobId = res.body._id;
    });

    it('should login as Student (Fix Verification)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'verified_student@lalan.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        studentToken = res.body.token;
        studentId = res.body._id;
    });

    it('should send a Broadcast Notification', async () => {
        const payload = {
            title: "E2E Test Broadcast",
            message: "This is a verification message.",
            type: "info",
            audience: "all"
        };

        const res = await request(app)
            .post('/api/notifications/send')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(payload);

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBeGreaterThan(0);
    });

    it('should receive Notification as Student', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.notifications)).toBe(true);

        const found = res.body.notifications.some(n => n.title === "E2E Test Broadcast");
        expect(found).toBe(true);
    });
});
