import { Router } from 'express';

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

export default router;
