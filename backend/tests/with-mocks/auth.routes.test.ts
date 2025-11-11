import { describe, expect, test, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../src/config/database';
import { userModel } from '../../src/models/user.model';

// Import app after mocks are set up
import app from '../../src/app';

let authToken: string;
let moverAuthToken: string;
const testUserId = new mongoose.Types.ObjectId();
const testMoverId = new mongoose.Types.ObjectId();

// Suppress console logs during tests
const originalConsole = {
  log: console.log,
  warn: console.warn,
  info: console.info,
  error: console.error,
};

beforeAll(async () => {
  // Suppress console output
  console.log = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
  console.error = jest.fn();

  await connectDB();

  // Clean up any existing test users
  const db = mongoose.connection.db;
  if (db) {
    await db.collection('users').deleteMany({
      googleId: {
        $in: [
          `test-google-id-auth-mock-${testUserId.toString()}`,
          `test-google-id-mover-auth-mock-${testMoverId.toString()}`
        ]
      }
    });
  }

  // Create test student user without role
  await (userModel as any).user.create({
    _id: testUserId,
    googleId: `test-google-id-auth-mock-${testUserId.toString()}`,
    email: `authmock${testUserId.toString()}@example.com`,
    name: 'Test Auth User Mock',
    userRole: undefined // No role initially
  });

  // Create test mover user
  await (userModel as any).user.create({
    _id: testMoverId,
    googleId: `test-google-id-mover-auth-mock-${testMoverId.toString()}`,
    email: `moverauthmock${testMoverId.toString()}@example.com`,
    name: 'Test Mover Auth Mock',
    userRole: 'MOVER',
    credits: 100
  });

  // Generate JWT tokens
  authToken = jwt.sign({ id: testUserId }, process.env.JWT_SECRET || 'default-secret');
  moverAuthToken = jwt.sign({ id: testMoverId }, process.env.JWT_SECRET || 'default-secret');
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Clean up test users
  const db = mongoose.connection.db;
  if (db) {
    await db.collection('users').deleteMany({
      googleId: {
        $in: [
          `test-google-id-auth-mock-${testUserId.toString()}`,
          `test-google-id-mover-auth-mock-${testMoverId.toString()}`
        ]
      }
    });
  }

  await disconnectDB();

  // Restore console
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.error = originalConsole.error;
});

describe('POST /api/auth/signup - Sign Up with Google (Mocked)', () => {
  test('should trigger next(err) when controller promise rejects', async () => {
    const { AuthController } = require('../../src/controllers/auth.controller');
    const controllerProto = AuthController.prototype;
    const originalMethod = controllerProto.signUp;

    controllerProto.signUp = (jest.fn() as any).mockRejectedValue(new Error('Controller error'));

    const response = await request(app)
      .post('/api/auth/signup')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(500);
    expect(controllerProto.signUp).toHaveBeenCalled();

    // Restore original method
    controllerProto.signUp = originalMethod;
  });

  test('should trigger next(err) for unknown Error types', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignUp = authService.signUpWithGoogle;
    
    authService.signUpWithGoogle = (jest.fn() as any).mockRejectedValue(new Error('Unknown service error'));

    const response = await request(app)
      .post('/api/auth/signup')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(500);

    // Restore original method
    authService.signUpWithGoogle = originalSignUp;
  });

  test('should trigger next(err) for non-Error exceptions', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignUp = authService.signUpWithGoogle;
    
    authService.signUpWithGoogle = (jest.fn() as any).mockRejectedValue('String error');

    const response = await request(app)
      .post('/api/auth/signup')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(500);

    // Restore original method
    authService.signUpWithGoogle = originalSignUp;
  });

  test('should return 401 for invalid Google token', async () => {
    // Mock the authService to throw invalid token error
    const authService = require('../../src/services/auth.service').authService;
    const originalSignUp = authService.signUpWithGoogle;
    
    authService.signUpWithGoogle = (jest.fn() as any).mockRejectedValue(new Error('Invalid Google token'));

    const response = await request(app)
      .post('/api/auth/signup')
      .send({ idToken: 'invalid-token' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid Google token');

    // Restore original method
    authService.signUpWithGoogle = originalSignUp;
  });

  test('should return 409 if user already exists', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignUp = authService.signUpWithGoogle;
    
    authService.signUpWithGoogle = (jest.fn() as any).mockRejectedValue(new Error('User already exists'));

    const response = await request(app)
      .post('/api/auth/signup')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('User already exists, please sign in instead.');

    // Restore original method
    authService.signUpWithGoogle = originalSignUp;
  });

  test('should return 500 for failed to process user error', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignUp = authService.signUpWithGoogle;
    
    authService.signUpWithGoogle = (jest.fn() as any).mockRejectedValue(new Error('Failed to process user'));

    const response = await request(app)
      .post('/api/auth/signup')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to process user information');

    // Restore original method
    authService.signUpWithGoogle = originalSignUp;
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

  test('should successfully sign up with valid token', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignUp = authService.signUpWithGoogle;
    
    const mockUserId = new mongoose.Types.ObjectId();
    const mockUser = {
      _id: mockUserId.toString(),
      googleId: 'new-user-google-id',
      email: 'newuser@example.com',
      name: 'New User',
      userRole: undefined
    };

    authService.signUpWithGoogle = (jest.fn() as any).mockResolvedValue({
      token: 'mock-jwt-token',
      user: mockUser
    }) as any;

    const response = await request(app)
      .post('/api/auth/signup')
      .send({ idToken: 'valid-token' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User signed up successfully');
    expect(response.body.data.token).toBe('mock-jwt-token');
    expect(response.body.data.user._id).toBe(mockUser._id);
    expect(response.body.data.user.email).toBe(mockUser.email);

    // Restore original method
    authService.signUpWithGoogle = originalSignUp;
  });
});

describe('POST /api/auth/signin - Sign In with Google (Mocked)', () => {
  test('should trigger next(err) when controller promise rejects', async () => {
    const { AuthController } = require('../../src/controllers/auth.controller');
    const controllerProto = AuthController.prototype;
    const originalMethod = controllerProto.signIn;

    controllerProto.signIn = (jest.fn() as any).mockRejectedValue(new Error('Controller error'));

    const response = await request(app)
      .post('/api/auth/signin')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(500);
    expect(controllerProto.signIn).toHaveBeenCalled();

    // Restore original method
    controllerProto.signIn = originalMethod;
  });

  test('should trigger next(err) for unknown Error types', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignIn = authService.signInWithGoogle;
    
    authService.signInWithGoogle = (jest.fn() as any).mockRejectedValue(new Error('Unknown service error')) as any;

    const response = await request(app)
      .post('/api/auth/signin')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(500);

    // Restore original method
    authService.signInWithGoogle = originalSignIn;
  });

  test('should trigger next(err) for non-Error exceptions', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignIn = authService.signInWithGoogle;
    
    authService.signInWithGoogle = (jest.fn() as any).mockRejectedValue('String error') as any;

    const response = await request(app)
      .post('/api/auth/signin')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(500);

    // Restore original method
    authService.signInWithGoogle = originalSignIn;
  });

  test('should return 401 for invalid Google token', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignIn = authService.signInWithGoogle;
    
    authService.signInWithGoogle = (jest.fn() as any).mockRejectedValue(new Error('Invalid Google token')) as any;

    const response = await request(app)
      .post('/api/auth/signin')
      .send({ idToken: 'invalid-token' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid Google token');

    // Restore original method
    authService.signInWithGoogle = originalSignIn;
  });



  test('should return 404 if user not found', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignIn = authService.signInWithGoogle;
    
    authService.signInWithGoogle = (jest.fn() as any).mockRejectedValue(new Error('User not found')) as any;

    const response = await request(app)
      .post('/api/auth/signin')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found, please sign up first.');

    // Restore original method
    authService.signInWithGoogle = originalSignIn;
  });

  test('should return 500 for failed to process user error', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignIn = authService.signInWithGoogle;
    
    authService.signInWithGoogle = (jest.fn() as any).mockRejectedValue(new Error('Failed to process user')) as any;

    const response = await request(app)
      .post('/api/auth/signin')
      .send({ idToken: 'test-token' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to process user information');

    // Restore original method
    authService.signInWithGoogle = originalSignIn;
  });

  test('should return 400 for missing idToken', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({});

    expect(response.status).toBe(400);
  });

  test('should successfully sign in with valid token', async () => {
    const authService = require('../../src/services/auth.service').authService;
    const originalSignIn = authService.signInWithGoogle;
    
    const mockUser = {
      _id: testMoverId.toString(),
      googleId: `test-google-id-mover-auth-mock-${testMoverId.toString()}`,
      email: `moverauthmock${testMoverId.toString()}@example.com`,
      name: 'Test Mover Auth Mock',
      userRole: 'MOVER'
    };

    authService.signInWithGoogle = (jest.fn() as any).mockResolvedValue({
      token: 'mock-jwt-token',
      user: mockUser
    }) as any;

    const response = await request(app)
      .post('/api/auth/signin')
      .send({ idToken: 'valid-token' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User signed in successfully');
    expect(response.body.data.token).toBe('mock-jwt-token');
    expect(response.body.data.user._id).toBe(mockUser._id);
    expect(response.body.data.user.email).toBe(mockUser.email);

    // Restore original method
    authService.signInWithGoogle = originalSignIn;
  });
});

describe('POST /api/auth/select-role - Select User Role (Mocked)', () => {
  test('should trigger next(err) when controller promise rejects', async () => {
    const { AuthController } = require('../../src/controllers/auth.controller');
    const controllerProto = AuthController.prototype;
    const originalMethod = controllerProto.selectRole;

    controllerProto.selectRole = (jest.fn() as any).mockRejectedValue(new Error('Controller error'));

    const response = await request(app)
      .post('/api/auth/select-role')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userRole: 'STUDENT' });

    expect(response.status).toBe(500);
    expect(controllerProto.selectRole).toHaveBeenCalled();

    // Restore original method
    controllerProto.selectRole = originalMethod;
  });

  test('should trigger next(err) for unknown Error types', async () => {
    const userModel = require('../../src/models/user.model').userModel;
    const originalUpdate = userModel.update;
    
    userModel.update = (jest.fn() as any).mockRejectedValue(new Error('Unknown database error')) as any;

    const response = await request(app)
      .post('/api/auth/select-role')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userRole: 'STUDENT' });

    expect(response.status).toBe(500);

    // Restore original method
    userModel.update = originalUpdate;
  });

  test('should trigger next(err) for non-Error exceptions', async () => {
    const userModel = require('../../src/models/user.model').userModel;
    const originalUpdate = userModel.update;
    
    userModel.update = (jest.fn() as any).mockRejectedValue('String error') as any;

    const response = await request(app)
      .post('/api/auth/select-role')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userRole: 'STUDENT' });

    expect(response.status).toBe(500);

    // Restore original method
    userModel.update = originalUpdate;
  });

  test('should successfully select STUDENT role', async () => {
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

  test('should return 404 when userModel.update returns null', async () => {
    // Mock userModel.update to return null (simulating user not found)
    const originalUpdate = userModel.update;
    userModel.update = (jest.fn() as any).mockResolvedValue(null) as any;

    const response = await request(app)
      .post('/api/auth/select-role')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userRole: 'STUDENT' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');

    // Restore original method
    userModel.update = originalUpdate;
  });

  test('should handle database error during role update', async () => {
    // Mock userModel.update to throw error
    const originalUpdate = userModel.update;
    userModel.update = (jest.fn() as any).mockRejectedValue(new Error('Database error')) as any;

    const response = await request(app)
      .post('/api/auth/select-role')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userRole: 'STUDENT' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Database error');

    // Restore original method
    userModel.update = originalUpdate;
  });
});
