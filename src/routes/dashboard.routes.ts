import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { protect, staffAccessible } from '../middlewares/auth.middleware';

const router = Router();

// All dashboard routes require authentication and staff access
router.use(protect, staffAccessible);

router.get('/stats', dashboardController.getStats);
router.get('/revenue', dashboardController.getRevenue);
router.get('/top-foods', dashboardController.getTopFoods);

export default router;
