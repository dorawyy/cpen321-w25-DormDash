import { describe, expect, test, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/database';
import { userModel } from '../../src/models/user.model';
import { jobService } from '../../src/services/job.service';
import { jobModel } from '../../src/models/job.model';


// Suppress socket-related warnings
const originalWarn = console.warn;
let authToken: string;
let testUserId: mongoose.Types.ObjectId;
beforeAll(async () => {
    console.warn = jest.fn(); 
    // Connect to test database
    await connectDB();

    const db = mongoose.connection.db;
    if (db) {
    await db.collection('users').deleteMany({ googleId: 'test-google-id' });
    }
    
    const testUser = await (userModel as any).user.create({
        googleId: 'test-google-id',
        email: 'test@example.com',
        name: 'Test User',
        userRole: 'STUDENT'
    });

    testUserId = testUser._id;

    const payload = { id: testUserId };
    authToken = jwt.sign(payload, process.env.JWT_SECRET || 'default-secret');
});

afterAll(async () => {
    await userModel.delete(testUserId);
    await jobModel.delete({ studentId: testUserId });

    // Disconnect from test database
    await disconnectDB();
    console.warn = originalWarn; 
});


describe('POST /api/jobs', () => {
    test('should successfully create a job', async () => {
      const reqData = {
        orderId: new mongoose.Types.ObjectId().toString(),
        studentId: testUserId.toString(),
        jobType: "STORAGE",
        volume: 10,
        price: 50,
        pickupAddress: { lat: 49.2827, lon: -123.1207, formattedAddress: 'Pickup Address' },
        dropoffAddress: { lat: 49.2827, lon: -123.1300, formattedAddress: 'Dropoff Address' },
        scheduledTime: new Date().toISOString()
    };

    const response = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(reqData)
    .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.id).toBeDefined();
    expect(response.body.message).toBe(`${reqData.jobType} job created successfully`);
    });
});
