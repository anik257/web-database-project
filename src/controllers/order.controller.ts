import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.middleware';
import * as orderService from '../services/order.service';

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private/Staff
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body);
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Staff
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status ? String(req.query.status) : undefined,
    tableId: req.query.tableId ? String(req.query.tableId) : undefined,
    staffId: req.query.staffId ? String(req.query.staffId) : undefined,
  };

  const orders = await orderService.getAllOrders(filters);
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private/Staff
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * @desc    Update order details or status
 * @route   PUT /api/orders/:id
 * @access  Private/Staff
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrder(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    data: order,
  });
});

/**
 * @desc    Delete/Cancel order
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await orderService.deleteOrder(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Order deleted successfully',
  });
});
