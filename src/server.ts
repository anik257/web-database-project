import dotenv from 'dotenv';
// Load environment variables before importing files that rely on them
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import logger from './utils/logger';

// Establish database connection
connectDB();

const PORT = process.env.PORT || 5000;

// Start server listening
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (operational safety)
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  if (err.stack) {
    logger.debug(err.stack);
  }
  // Gracefully close server, then exit
  server.close(() => {
    logger.info('Server closed due to unhandled promise rejection.');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  if (err.stack) {
    logger.debug(err.stack);
  }
  logger.info('Exiting process due to uncaught exception...');
  process.exit(1);
});
