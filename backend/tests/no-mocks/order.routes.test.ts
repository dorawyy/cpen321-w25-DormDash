import { describe, expect, test, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/database';
import { userModel } from '../../src/models/user.model';

// Suppress socket-related warnings
const originalWarn = console.warn;
let authToken: string;
const testUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

beforeAll(async () => {
  console.warn = jest.fn(); // Suppress warnings
  // Connect to test database
  await connectDB();

  // Ensure test user is clean - delete by googleId
  const db = mongoose.connection.db;
  if (db) {
    await db.collection('users').deleteMany({ googleId: 'test-google-id' });
  }

  // Create a test user in DB with specific _id
  await (userModel as any).user.create({
    _id: testUserId,
    googleId: 'test-google-id',
    email: 'test@example.com',
    name: 'Test User',
    userRole: 'STUDENT'
  });

  // Generate a real JWT token for testing
  const payload = { id: testUserId };
  authToken = jwt.sign(payload, process.env.JWT_SECRET || 'default-secret');
});

beforeEach(async () => {
  // Clear orders and jobs collections before each test to ensure isolation
  const db = mongoose.connection.db;
  if (db) {
    await db.collection('orders').deleteMany({ studentId: testUserId });
    await db.collection('jobs').deleteMany({ studentId: testUserId });
  }
});

afterAll(async () => {
  // Clean up test user
  await userModel.delete(testUserId);
  // Disconnect from test database
  await disconnectDB();
  console.warn = originalWarn; // Restore warnings
});

describe('POST /api/order/quote - No Mocks', () => {
  test('should return a quote for valid input', async () => {
    const response = await request(app)
      .post('/api/order/quote')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        studentId: testUserId,
        studentAddress: { lat: 49.2827, lon: -123.1207, formattedAddress: 'Test Address' }
      })
      .expect(200);

    expect(response.body).toHaveProperty('distancePrice');
    expect(response.body).toHaveProperty('warehouseAddress');
    expect(response.body).toHaveProperty('dailyStorageRate');
  });

  // Add more tests for invalid inputs, etc.
});

describe('POST /api/order - No Mocks', () => {
  test('should create an order for valid input', async () => {
    const response = await request(app)
      .post('/api/order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        studentId: testUserId,
        volume: 10,
        totalPrice: 50,
        studentAddress: { lat: 49.2827, lon: -123.1207, formattedAddress: 'Test Address' },
        warehouseAddress: { lat: 49.2606, lon: -123.1133, formattedAddress: 'Warehouse Address' },
        pickupTime: new Date().toISOString(),
        returnTime: new Date(Date.now() + 86400000).toISOString(), // 1 day later
        returnAddress: { lat: 49.2827, lon: -123.1207, formattedAddress: 'Return Address' }
      })
      .expect(201);

    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('studentId');
  });
});

describe('POST /api/order/create-return-Job - No Mocks', () => {
  test('should return 500 if no active order', async () => {
    await request(app)
      .post('/api/order/create-return-Job')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        returnAddress: { lat: 49.2827, lon: -123.1207, formattedAddress: 'Return Address' },
        actualReturnDate: new Date().toISOString()
      })
      .expect(500);
  });
});

// Add similar describe blocks for other order endpoints: GET /api/order/all-orders, GET /api/order/active-order, DELETE /api/order/cancel-order

describe('GET /api/order/all-orders - No Mocks', () => {
  test('should return all orders for authenticated user', async () => {
    // First, create a couple of orders
    const pickupTime = new Date().toISOString();
    const returnTime = new Date(Date.now() + 86400000).toISOString(); // 1 day later
    await request(app)
      .post('/api/order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        studentId: testUserId,
        volume: 10,
        totalPrice: 50,
        studentAddress: { lat: 49.2827, lon: -123.1207, formattedAddress: 'Test Address' },
        warehouseAddress: { lat: 55.2606, lon: -222.1133, formattedAddress: 'Warehouse Address' },
        pickupTime: pickupTime,
        returnTime: returnTime,
      })
      .expect(201);

    await request(app)
      .post('/api/order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        studentId: testUserId,
        volume: 5,
        totalPrice: 30,
        studentAddress: { lat: 40.7128, lon: -74.0060, formattedAddress: 'Test Address' },
        warehouseAddress: { lat: 34.0522, lon: -118.2437, formattedAddress: 'Warehouse Address' },
        pickupTime: pickupTime,
        returnTime: returnTime,
      })
      .expect(201);
      
    // Now, fetch all orders

    const response = await request(app)
      .get('/api/order/all-orders')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('orders');
    expect(Array.isArray(response.body.orders)).toBe(true);
    expect(response.body.orders.length).toBe(2);
  });
  
});

describe('GET /api/order/active-order - No Mocks', () => {
  test('should return 404 if no active order', async () => {
    const response = await request(app)
      .get('/api/order/active-order')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    expect(response.body).toBe(null);
  });
  test('should return active order if exists', async () => {
    // First, create an active order
    // create static pickup and return times
    const pickupTime = new Date().toISOString();
    const returnTime = new Date(Date.now() + 86400000).toISOString(); // 1 day later
    const createResponse = await request(app)
        .post('/api/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
            studentId: testUserId,
            volume: 10,
            totalPrice: 50,
            studentAddress: { lat: 49.2827, lon: -123.1207, formattedAddress: 'Test Address' },
            warehouseAddress: { lat: 55.2606, lon: -222.1133, formattedAddress: 'Warehouse Address' },
            pickupTime: pickupTime,
            returnTime: returnTime,
        })  
        .expect(201); // Ensure order is created
        
    const testOrderId = createResponse.body._id;
        
    // Now, fetch the active order
    const response = await request(app)
      .get('/api/order/active-order')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.id).toBe(testOrderId.toString());
    expect(response.body).toHaveProperty('studentId');
    expect(response.body.studentId).toBe(testUserId.toString());
    expect(response.body).toHaveProperty('volume');
    expect(response.body.volume).toBe(10);
    expect(response.body).toHaveProperty('price');
    expect(response.body.price).toBe(50);
    expect(response.body).toHaveProperty('studentAddress');
    expect(response.body.studentAddress).toEqual({ lat: 49.2827, lon: -123.1207, formattedAddress: 'Test Address' });
    expect(response.body).toHaveProperty('warehouseAddress');
    expect(response.body.warehouseAddress).toEqual({ lat: 55.2606, lon: -222.1133, formattedAddress: 'Warehouse Address' });
    expect(response.body).toHaveProperty('pickupTime');
    expect(new Date(response.body.pickupTime).toISOString()).toBe(pickupTime);
    expect(response.body).toHaveProperty('returnTime');
    expect(new Date(response.body.returnTime).toISOString()).toBe(returnTime);

  });
});

describe('DELETE /api/order/cancel-order - No Mocks', () => {
  test('should cancel the active order for authenticated user', async () => {
    // First, create an active order
    const pickupTime = new Date().toISOString();
    const returnTime = new Date(Date.now() + 86400000).toISOString(); // 1 day later
    await request(app)
      .post('/api/order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        studentId: testUserId,
        volume: 10,
        totalPrice: 50,
        studentAddress: { lat: 49.2827, lon: -123.1207, formattedAddress: 'Test Address' },
        warehouseAddress: { lat: 49.2606, lon: -123.1133, formattedAddress: 'Warehouse Address' },
        pickupTime: pickupTime,
        returnTime: returnTime,
      })
      .expect(201);

    const response = await request(app)
      .delete('/api/order/cancel-order')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Order cancelled successfully');
  });

  test('should return 400 if no active order to cancel', async () => {
    const response = await request(app)
      .delete('/api/order/cancel-order')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Order not found');
  });

  test('should return 400 if order is already accepted', async () => {
    // First, create an active order
    const pickupTime = new Date().toISOString();
    const returnTime = new Date(Date.now() + 86400000).toISOString(); // 1 day later
    const createResponse = await request(app)
      .post('/api/order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        studentId: testUserId,
        volume: 10,
        totalPrice: 50,
        studentAddress: { lat: 49.2827, lon: -123.1207, formattedAddress: 'Test Address' },
        warehouseAddress: { lat: 49.2606, lon: -123.1133, formattedAddress: 'Warehouse Address' },
        pickupTime: pickupTime,
        returnTime: returnTime,
      })
      .expect(201);
    
    const testOrderId = createResponse.body._id;

    // Manually update order status to 'ACCEPTED' in the database
    const db = mongoose.connection.db;
    if (db) {
      await db.collection('orders').updateOne(
        { _id: new mongoose.Types.ObjectId(testOrderId) },
        { $set: { status: 'ACCEPTED' } }
      );
    }

    // Now, attempt to cancel the order
    const response = await request(app)
      .delete('/api/order/cancel-order')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Cannot cancel an order that is already accepted');
  });
});