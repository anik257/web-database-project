/**
 * Custom Operational API Error Class.
 * Standardizes structured error reports across the application.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;
  public readonly errors?: string[];

  constructor(
    statusCode: number,
    message: string,
    errors?: string[],
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Helper: 400 Bad Request
   */
  static badRequest(message: string, errors?: string[]): ApiError {
    return new ApiError(400, message, errors);
  }

  /**
   * Helper: 401 Unauthorized
   */
  static unauthorized(message: string): ApiError {
    return new ApiError(401, message);
  }

  /**
   * Helper: 403 Forbidden
   */
  static forbidden(message: string): ApiError {
    return new ApiError(403, message);
  }

  /**
   * Helper: 404 Not Found
   */
  static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }

  /**
   * Helper: 409 Conflict
   */
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  /**
   * Helper: 500 Internal Server Error
   */
  static internal(message: string, errors?: string[]): ApiError {
    return new ApiError(500, message, errors, false);
  }
}
