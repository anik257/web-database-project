import { Router } from 'express';
import { protect, adminOnly, staffAccessible } from '../middlewares/auth.middleware';
import categoryRoutes from './category.routes';
import menuItemRoutes from './menu-item.routes';
import tableRoutes from './table.routes';
import orderRoutes from './order.routes';
import staffRoutes from './staff.routes';
import billRoutes from './bill.routes';

const router = Router();

/**
 * Health check route to verify backend connectivity and state.
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Restaurant Management System API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Resource Routes (mounted under /api/v1)
 */
router.use('/categories', categoryRoutes);
router.use('/menu', menuItemRoutes);
router.use('/tables', tableRoutes);
router.use('/orders', orderRoutes);
router.use('/staff', staffRoutes);
router.use('/bills', billRoutes);

/**
 * Example: Admin-only route.
 * Restricts access to users with 'admin' role.
 */
router.get('/admin-only', protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted. Welcome to the Admin-Only area.',
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
});

/**
 * Example: Staff-accessible route.
 * Restricts access to users with 'admin' or 'staff' role.
 */
router.get('/staff-accessible', protect, staffAccessible, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted. Welcome to the Staff-Accessible area.',
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
});

/**
 * Example: Any authenticated user route.
 * Accessible by any user who has a valid JWT, regardless of their role.
 */
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted. Welcome to your user profile.',
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
});

export default router;


