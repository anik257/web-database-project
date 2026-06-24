import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import logger from '../utils/logger';

/**
 * Express global error handling middleware.
 * Catches errors, formats response, and sanitizes production logs/messages.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error stack trace or message
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  if (err.stack) {
    logger.debug(err.stack);
  }

  // Handle Mongoose Cast Error (Invalid ID format)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = ApiError.notFound(message);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    const message = `Duplicate value entered for field(s): ${field}. Please use another value.`;
    error = ApiError.badRequest(message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((val: any) => val.message);
    error = ApiError.badRequest('Validation Failed', errors);
  }

  // Handle JWT Malformed Error
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid security token. Please log in again.');
  }

  // Handle JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Your security token has expired. Please log in again.');
  }

  // Fallback to standard ApiError if not already one
  const statusCode = error.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // For unhandled non-operational errors (bugs, db failures), return generic message in production
  let responseMessage = error.message;
  if (!error.isOperational && isProd && statusCode === 500) {
    responseMessage = 'Something went wrong on the server';
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: responseMessage,
    errors: error.errors || undefined,
    stack: isProd ? undefined : err.stack,
  });
};
