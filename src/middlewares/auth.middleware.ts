import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model';
import { verifyToken, TokenPayload } from '../utils/jwt.util';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from './async.middleware';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Extends Express Request with the authenticated user document.
 */
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Supported user roles in the system.
 */
export type UserRole = 'admin' | 'staff';

// ─────────────────────────────────────────────────────────────
// protect — JWT verification + user lookup
// ─────────────────────────────────────────────────────────────

/**
 * Middleware: Verify JWT access token from the Authorization header
 * and attach the full User document to `req.user`.
 *
 * Usage:
 *   router.get('/profile', protect, controller);
 */
export const protect = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    // 1. Extract token from "Bearer <token>" header
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(
        ApiError.unauthorized('Access denied. No token provided. Please log in.')
      );
    }

    // 2. Verify and decode token
    let decoded: TokenPayload;
    try {
      decoded = verifyToken(token);
    } catch {
      return next(
        ApiError.unauthorized('Invalid or expired token. Please log in again.')
      );
    }

    // 3. Fetch user from database — ensure user still exists and is active
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        ApiError.unauthorized('The user belonging to this token no longer exists.')
      );
    }

    if (!currentUser.isActive) {
      return next(
        ApiError.forbidden('Your account has been deactivated. Contact an administrator.')
      );
    }

    // 4. Attach user to request
    req.user = currentUser;
    next();
  }
);

// ─────────────────────────────────────────────────────────────
// authorize — Role-based access control
// ─────────────────────────────────────────────────────────────

/**
 * Middleware: Restrict access to users with one of the specified roles.
 * Must be chained AFTER `protect`.
 *
 * Usage:
 *   router.delete('/users/:id', protect, authorize('admin'), controller);
 *   router.get('/orders', protect, authorize('admin', 'staff'), controller);
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        ApiError.unauthorized('Authentication required. Please use the protect middleware first.')
      );
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${userRole}' is not authorized to perform this action. Required: ${allowedRoles.join(' or ')}.`
        )
      );
    }

    next();
  };
};

// ─────────────────────────────────────────────────────────────
// Convenience role shortcuts
// ─────────────────────────────────────────────────────────────

/**
 * Only Admin users can access.
 *
 * Usage:
 *   router.post('/categories', protect, adminOnly, controller);
 */
export const adminOnly = authorize('admin');

/**
 * Both Admin and Staff users can access.
 *
 * Usage:
 *   router.get('/orders', protect, staffAccessible, controller);
 */
export const staffAccessible = authorize('admin', 'staff');

// ─────────────────────────────────────────────────────────────
// Example route patterns (for reference, not executable)
// ─────────────────────────────────────────────────────────────
//
// ┌───────────────────────────────────────────────────────────┐
// │ Admin-only routes:                                       │
// │                                                           │
// │   router.post('/staff',   protect, adminOnly, create);    │
// │   router.delete('/users/:id', protect, adminOnly, remove);│
// │   router.put('/settings', protect, adminOnly, update);    │
// ├───────────────────────────────────────────────────────────┤
// │ Staff-accessible routes (Admin + Staff):                  │
// │                                                           │
// │   router.get('/orders',       protect, staffAccessible, list);   │
// │   router.post('/orders',      protect, staffAccessible, create); │
// │   router.put('/orders/:id',   protect, staffAccessible, update); │
// ├───────────────────────────────────────────────────────────┤
// │ Any authenticated user (no role check):                   │
// │                                                           │
// │   router.get('/profile', protect, getProfile);            │
// └───────────────────────────────────────────────────────────┘
