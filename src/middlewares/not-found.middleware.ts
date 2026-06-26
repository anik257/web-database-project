import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';

/**
 * Middleware: Handle unmatched routes by passing a 404 ApiError to next().
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Requested route not found: ${req.method} ${req.originalUrl}`));
};
