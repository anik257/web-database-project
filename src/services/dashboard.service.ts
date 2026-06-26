import Order from '../models/order.model';
import Table from '../models/table.model';
import Staff from '../models/staff.model';
import Bill from '../models/bill.model';
import MenuItem from '../models/menu-item.model';

/**
 * Service: Get dashboard summary statistics.
 * Uses MongoDB aggregation pipelines for efficient computation.
 */
export const getDashboardStats = async () => {
  // Define the start and end of today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Run all queries in parallel for performance
  const [
    totalOrders,
    todaysOrders,
    todaysRevenueResult,
    availableTables,
    totalStaff,
  ] = await Promise.all([
    // 1. Total Orders count
    Order.countDocuments(),

    // 2. Today's Orders count
    Order.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),

    // 3. Today's Revenue (sum of paid bills created today)
    Bill.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]),

    // 4. Available Tables count
    Table.countDocuments({ status: 'available' }),

    // 5. Total Staff count
    Staff.countDocuments(),
  ]);

  return {
    totalOrders,
    todaysOrders,
    todaysRevenue: todaysRevenueResult.length > 0 ? todaysRevenueResult[0].totalRevenue : 0,
    availableTables,
    totalStaff,
  };
};

/**
 * Service: Get monthly revenue chart data.
 * Returns revenue grouped by month for the current year using aggregation pipeline.
 */
export const getMonthlyRevenue = async () => {
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = await Bill.aggregate([
    // Stage 1: Filter to paid bills in the current year
    {
      $match: {
        paymentStatus: 'Paid',
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
      },
    },
    // Stage 2: Group by month
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    // Stage 3: Sort by month ascending
    {
      $sort: { _id: 1 },
    },
    // Stage 4: Project human-readable month names
    {
      $project: {
        _id: 0,
        month: {
          $arrayElemAt: [
            [
              '', 'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December',
            ],
            '$_id',
          ],
        },
        revenue: { $round: ['$revenue', 2] },
        billCount: '$count',
      },
    },
  ]);

  return {
    year: currentYear,
    data: monthlyRevenue,
  };
};

/**
 * Service: Get top selling food items.
 * Uses aggregation pipeline to unwind order items and rank by total quantity sold.
 */
export const getTopSellingFoods = async (limit: number = 10) => {
  const topFoods = await Order.aggregate([
    // Stage 1: Only consider non-cancelled orders
    {
      $match: {
        status: { $nin: ['Cancelled'] },
      },
    },
    // Stage 2: Unwind items array to get individual item entries
    {
      $unwind: '$items',
    },
    // Stage 3: Group by foodId and sum quantities and revenue
    {
      $group: {
        _id: '$items.foodId',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
        orderCount: { $sum: 1 },
      },
    },
    // Stage 4: Sort by total quantity sold (descending)
    {
      $sort: { totalQuantity: -1 },
    },
    // Stage 5: Limit results
    {
      $limit: limit,
    },
    // Stage 6: Lookup food details from MenuItem collection
    {
      $lookup: {
        from: MenuItem.collection.collectionName,
        localField: '_id',
        foreignField: '_id',
        as: 'foodDetails',
      },
    },
    // Stage 7: Unwind lookup result (1-to-1)
    {
      $unwind: {
        path: '$foodDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    // Stage 8: Project final shape
    {
      $project: {
        _id: 0,
        foodId: '$_id',
        name: '$foodDetails.name',
        price: '$foodDetails.price',
        image: '$foodDetails.image',
        totalQuantity: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        orderCount: 1,
      },
    },
  ]);

  return topFoods;
};
