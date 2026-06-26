import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import logger from '../utils/logger';

/**
 * Centralized global Express error handler middleware.
 * Intercepts Mongoose, Zod, JWT, Parsing, and Custom API errors.
 * Sanitizes stack trace outputs in production.
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

  // Log errors based on severity
  const statusCode = err.statusCode || 500;
  if (statusCode < 500) {
    logger.warn(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  } else {
    logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    if (err.stack) {
      logger.debug(err.stack);
    }
  }

  // 1. Express Body Parser JSON Syntax Error
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as any).status === 400 &&
    'body' in err
  ) {
    error = ApiError.badRequest(`Malformed JSON body payload: ${err.message}`);
  }

  // 2. Mongoose Cast Error (Invalid Hex IDs)
  if (err.name === 'CastError') {
    const message = `Resource not found with invalid format of path '${err.path}' and value '${err.value}'`;
    error = ApiError.notFound(message);
  }

  // 3. Mongoose Duplicate Key Error (MongoDB Code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    const values = Object.values(err.keyValue || {}).join(', ');
    const message = `Duplicate entry for field(s) '${fields}' with value(s) '${values}'. Please use unique values.`;
    error = ApiError.badRequest(message);
  }

  // 4. Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((val: any) => val.message);
    error = ApiError.badRequest('Validation Failed', errors);
  }

  // 5. Zod schema validation errors (fallback handler)
  if (err.name === 'ZodError' || err.constructor?.name === 'ZodError') {
    const errors = (err.issues || []).map(
      (issue: any) => `${issue.path.join('.')}: ${issue.message}`
    );
    error = ApiError.badRequest('Validation Failed', errors);
  }

  // 6. JWT Invalid format error
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid security token. Please log in again.');
  }

  // 7. JWT Expired token error
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Your security token has expired. Please log in again.');
  }

  // Resolve status definitions and formats
  const finalStatusCode = error.statusCode || 500;
  const status = error.status || (finalStatusCode >= 500 ? 'error' : 'fail');
  const isProd = process.env.NODE_ENV === 'production';

  // Sanitize 500 errors in production to avoid leaking database/infrastructure schemas
  let responseMessage = error.message;
  if (!error.isOperational && isProd && finalStatusCode === 500) {
    responseMessage = 'Something went wrong on the server';
  }

  res.status(finalStatusCode).json({
    success: false,
    status,
    statusCode: finalStatusCode,
    message: responseMessage,
    errors: error.errors || undefined,
    stack: isProd ? undefined : err.stack,
  });
};
