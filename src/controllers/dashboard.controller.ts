import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.middleware';
import * as dashboardService from '../services/dashboard.service';

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/dashboard/stats
 * @access  Private/Staff
 */
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Get monthly revenue chart data
 * @route   GET /api/dashboard/revenue
 * @access  Private/Staff
 */
export const getRevenue = asyncHandler(async (_req: Request, res: Response) => {
  const revenue = await dashboardService.getMonthlyRevenue();
  res.status(200).json({
    success: true,
    data: revenue,
  });
});

/**
 * @desc    Get top selling foods
 * @route   GET /api/dashboard/top-foods
 * @access  Private/Staff
 */
export const getTopFoods = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const topFoods = await dashboardService.getTopSellingFoods(limit);
  res.status(200).json({
    success: true,
    count: topFoods.length,
    data: topFoods,
  });
});
