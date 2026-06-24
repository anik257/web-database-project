export class ApiError extends Error {
  public readonly statusCode: number;
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
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string, errors?: string[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }

  static internal(message: string, errors?: string[]): ApiError {
    return new ApiError(500, message, errors, false);
  }
}
