import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Connects to MongoDB database using the environment URI.
 */
export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    logger.error('MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  try {
    logger.info('Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoURI);

    logger.info(`MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Monitor connection events for production visibility
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error event: ${err}`);
});
