import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from './async.middleware';

// Interface representing the JWT token payload structure
export interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Middleware to protect routes and verify JWT tokens.
 */
export const protect = asyncHandler(async (req: any, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Read header from Request
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(ApiError.unauthorized('Not authorized to access this route. Please log in.'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload;

    // Attach decoded user info to the request object (can be fetched from database once models are set up)
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return next(ApiError.unauthorized('Not authorized to access this route. Token verification failed.'));
  }
});

/**
 * Middleware to restrict route access to specific roles.
 * Must be used after 'protect' middleware.
 */
export const authorize = (...roles: string[]) => {
  return (req: any, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required to perform this action.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `User role '${req.user.role}' is not authorized to access this route.`
        )
      );
    }

    next();
  };
};
