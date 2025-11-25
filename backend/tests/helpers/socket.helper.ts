/**
 * Socket.IO Test Helper
 * Provides utilities for setting up student and mover socket clients in tests
 */
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { initSocket } from '../../src/socket';
import app from '../../src/app';

export interface SocketTestContext {
  server: http.Server;
  io: SocketIOServer;
  studentSocket: ClientSocket | null;
  moverSocket: ClientSocket | null;
  port: number;
}

export interface SocketTestUsers {
  studentId: mongoose.Types.ObjectId;
  moverId: mongoose.Types.ObjectId;
  studentToken: string;
  moverToken: string;
}

/**
 * Generate JWT tokens for test users
 */
export function generateTestTokens(
  studentId: mongoose.Types.ObjectId,
  moverId: mongoose.Types.ObjectId
): { studentToken: string; moverToken: string } {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return {
    studentToken: jwt.sign({ id: studentId }, secret),
    moverToken: jwt.sign({ id: moverId }, secret),
  };
}

/**
 * Initialize Socket.IO server for testing
 */
export async function initSocketServer(port: number): Promise<{ server: http.Server; io: SocketIOServer }> {
  const server = http.createServer(app);
  const io = initSocket(server);

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      resolve();
    });
  });

  return { server, io };
}

/**
 * Create a student socket client connection
 */
export async function createStudentSocket(
  port: number,
  studentToken: string,
  timeout = 5000
): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const socket = ioClient(`http://localhost:${port}`, {
      auth: { token: `Bearer ${studentToken}` },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });

    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => {
      socket.disconnect();
      reject(err);
    });

    setTimeout(() => {
      socket.disconnect();
      reject(new Error('Student socket connection timeout'));
    }, timeout);
  });
}

/**
 * Create a mover socket client connection
 */
export async function createMoverSocket(
  port: number,
  moverToken: string,
  timeout = 5000
): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const socket = ioClient(`http://localhost:${port}`, {
      auth: { token: `Bearer ${moverToken}` },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });

    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => {
      socket.disconnect();
      reject(err);
    });

    setTimeout(() => {
      socket.disconnect();
      reject(new Error('Mover socket connection timeout'));
    }, timeout);
  });
}

/**
 * Helper function to wait for a specific socket event
 */
export function waitForSocketEvent(socket: ClientSocket, event: string, timeout = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for socket event: ${event}`));
    }, timeout);

    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

/**
 * Helper function to wait for a socket event with optional timeout
 * Returns null if timeout occurs instead of throwing
 */
export function waitForSocketEventOptional(
  socket: ClientSocket,
  event: string,
  timeout = 2000
): Promise<any | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(null);
    }, timeout);

    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

/**
 * Disconnect a socket safely
 */
export async function disconnectSocket(socket: ClientSocket | null): Promise<void> {
  if (!socket) return;

  return new Promise((resolve) => {
    if (!socket.connected) {
      resolve();
      return;
    }

    socket.disconnect();
    socket.on('disconnect', () => {
      resolve();
    });

    // Fallback in case disconnect event doesn't fire
    setTimeout(() => {
      resolve();
    }, 100);
  });
}

/**
 * Cleanup all socket connections and server
 */
export async function cleanupSocketServer(context: SocketTestContext): Promise<void> {
  // Disconnect student socket
  if (context.studentSocket) {
    await disconnectSocket(context.studentSocket);
    context.studentSocket = null;
  }

  // Disconnect mover socket
  if (context.moverSocket) {
    await disconnectSocket(context.moverSocket);
    context.moverSocket = null;
  }

  // Close Socket.IO and all connections
  if (context.io) {
    context.io.disconnectSockets();
    await new Promise<void>((resolve) => {
      context.io.close(() => {
        resolve();
      });
    });
  }

  // Close HTTP server
  if (context.server) {
    await new Promise<void>((resolve) => {
      context.server.close((err) => {
        if (err) console.error('Error closing server:', err);
        resolve();
      });
    });
  }
}

/**
 * Full socket test setup - creates server and both student/mover sockets
 */
export async function setupSocketTest(
  port: number,
  users: SocketTestUsers
): Promise<SocketTestContext> {
  const { server, io } = await initSocketServer(port);

  const studentSocket = await createStudentSocket(port, users.studentToken);
  const moverSocket = await createMoverSocket(port, users.moverToken);

  return {
    server,
    io,
    studentSocket,
    moverSocket,
    port,
  };
}

/**
 * Collect multiple socket events
 */
export function collectSocketEvents(
  socket: ClientSocket,
  eventName: string,
  count: number,
  timeout = 5000
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const events: any[] = [];
    const timer = setTimeout(() => {
      socket.off(eventName, handler);
      if (events.length > 0) {
        resolve(events);
      } else {
        reject(new Error(`Timeout collecting ${count} ${eventName} events`));
      }
    }, timeout);

    const handler = (data: any) => {
      events.push(data);
      if (events.length >= count) {
        clearTimeout(timer);
        socket.off(eventName, handler);
        resolve(events);
      }
    };

    socket.on(eventName, handler);
  });
}
