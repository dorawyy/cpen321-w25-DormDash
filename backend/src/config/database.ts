import mongoose from 'mongoose';
import logger from '../utils/logger.util';

// Setup connection event listeners (runs once when module is loaded)
mongoose.connection.on('error', () => {
  logger.error('❌ MongoDB connection error');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  mongoose.connection
    .close()
    .then(() => {
      logger.info('MongoDB connection closed through app termination');
      process.exitCode = 0;
    })
    .catch((err: unknown) => {
      logger.error(
        'Error closing MongoDB connection on SIGINT:',
        String(err)
      );
      process.exitCode = 1;
    });
});

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI is not configured in environment variables');
    }

    await mongoose.connect(uri);
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', String(error));
    process.exitCode = 1;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('✅ MongoDB disconnected successfully');
  } catch (error) {
    logger.error('❌ Error disconnecting from MongoDB:', String(error));
  }
};
