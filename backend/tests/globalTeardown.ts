import mongoose from 'mongoose';

export default async function globalTeardown() {
  // Force close all mongoose connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Wait a bit for any remaining async operations
  await new Promise(resolve => setTimeout(resolve, 100));
}

