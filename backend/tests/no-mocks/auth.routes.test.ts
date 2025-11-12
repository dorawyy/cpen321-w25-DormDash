import { describe, expect, test, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/database';
import { userModel } from '../../src/models/user.model';
import { jobModel } from '../../src/models/job.model';
import { orderModel } from '../../src/models/order.model';
import { JobStatus, JobType } from '../../src/types/job.type';
import { OrderStatus } from '../../src/types/order.types';

const originalWarn = console.warn;
let authToken: string;
let moverAuthToken: string;
let testUserId: mongoose.Types.ObjectId;
let testMoverId: mongoose.Types.ObjectId;

// Cleanup function to delete all users, jobs, and orders
const cleanupDatabase = async () => {
    const db = mongoose.connection.db;
    if (db) {
        await db.collection('users').deleteMany({});
        await db.collection('jobs').deleteMany({});
        await db.collection('orders').deleteMany({});
    }
};

beforeAll(async () => {
    console.warn = jest.fn(); 
    await connectDB();

    // Clean up all test data before starting
    await cleanupDatabase();
    
    // Create test student user
    const testUser = await (userModel as any).user.create({
        googleId: 'test-google-id-student',
        email: 'test-student@example.com',
        name: 'Test Student',
        userRole: 'STUDENT'
    });

    testUserId = testUser._id;

    // Create test mover user
    const testMover = await (userModel as any).user.create({
        googleId: 'test-google-id-mover',
        email: 'test-mover@example.com',
        name: 'Test Mover',
        userRole: 'MOVER'
    });

    testMoverId = testMover._id;

    // Generate JWT tokens
    const studentPayload = { id: testUserId };
    authToken = jwt.sign(studentPayload, process.env.JWT_SECRET || 'default-secret');

    const moverPayload = { id: testMoverId };
    moverAuthToken = jwt.sign(moverPayload, process.env.JWT_SECRET || 'default-secret');
});

beforeEach(async () => {
    // Clear jobs and orders collections before each test for isolation
    // Dont delete users here because test users (testUserId, testMoverId) need to persist across tests
    const db = mongoose.connection.db;
    if (db) {
       await db.collection('jobs').deleteMany({});
       await db.collection('orders').deleteMany({});
    }
});

afterAll(async () => {
    await cleanupDatabase();
    await disconnectDB();
    console.warn = originalWarn; 
});

describe('POST /api/auth/signup - Sign Up with Google', () => {
    test('should return 401 for invalid Google token', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({ idToken: 'invalid-token-12345' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid Google token');
    });

    test('should return 400 for missing idToken', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({});

        expect(response.status).toBe(400);
    });

    test('should return 400 for invalid idToken type', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({ idToken: 12345 });

        expect(response.status).toBe(400);
    });
});

describe('POST /api/auth/signin - Sign In with Google', () => {
    test('should return 401 for invalid Google token', async () => {
        const response = await request(app)
            .post('/api/auth/signin')
            .send({ idToken: 'invalid-token-67890' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid Google token');
    });

    test('should return 400 for missing idToken', async () => {
        const response = await request(app)
            .post('/api/auth/signin')
            .send({});

        expect(response.status).toBe(400);
    });

    test('should return 400 for invalid idToken type', async () => {
        const response = await request(app)
            .post('/api/auth/signin')
            .send({ idToken: { invalid: 'object' } });

        expect(response.status).toBe(400);
    });
});

describe('POST /api/auth/select-role - Select User Role', () => {
    test('should successfully select STUDENT role for authenticated user', async () => {
        const response = await request(app)
            .post('/api/auth/select-role')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ userRole: 'STUDENT' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Role selected successfully');
        expect(response.body.data.user.userRole).toBe('STUDENT');
    });

    test('should successfully select MOVER role and initialize credits to 0', async () => {
        const response = await request(app)
            .post('/api/auth/select-role')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ userRole: 'MOVER' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Role selected successfully');
        expect(response.body.data.user.userRole).toBe('MOVER');
        expect(response.body.data.user.credits).toBe(0);
    });

    test('should return 401 for missing authentication token', async () => {
        const response = await request(app)
            .post('/api/auth/select-role')
            .send({ userRole: 'STUDENT' });

        expect(response.status).toBe(401);
    });

    test('should return 401 for invalid authentication token', async () => {
        const response = await request(app)
            .post('/api/auth/select-role')
            .set('Authorization', 'Bearer invalid-token')
            .send({ userRole: 'STUDENT' });

        expect(response.status).toBe(401);
    });

    test('should return 400 for missing userRole', async () => {
        const response = await request(app)
            .post('/api/auth/select-role')
            .set('Authorization', `Bearer ${authToken}`)
            .send({});

        expect(response.status).toBe(400);
    });

    test('should return 400 for invalid userRole', async () => {
        const response = await request(app)
            .post('/api/auth/select-role')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ userRole: 'INVALID_ROLE' });

        expect(response.status).toBe(400);
    });
});
