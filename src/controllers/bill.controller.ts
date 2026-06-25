import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.middleware';
import * as billService from '../services/bill.service';

/**
 * @desc    Generate a bill for an order
 * @route   POST /api/bills
 * @access  Private/Staff
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const bill = await billService.generateBill(req.body);
  res.status(201).json({
    success: true,
    message: 'Bill generated successfully',
    data: bill,
  });
});

/**
 * @desc    Get all bills
 * @route   GET /api/bills
 * @access  Private/Staff
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    paymentStatus: req.query.paymentStatus ? String(req.query.paymentStatus) : undefined,
    paymentMethod: req.query.paymentMethod ? String(req.query.paymentMethod) : undefined,
  };

  const bills = await billService.getAllBills(filters);
  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills,
  });
});

/**
 * @desc    Get bill by ID
 * @route   GET /api/bills/:id
 * @access  Private/Staff
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const bill = await billService.getBillById(req.params.id);
  res.status(200).json({
    success: true,
    data: bill,
  });
});

/**
 * @desc    Pay a bill
 * @route   PUT /api/bills/:id/pay
 * @access  Private/Staff
 */
export const pay = asyncHandler(async (req: Request, res: Response) => {
  const { paymentMethod } = req.body;
  const bill = await billService.payBill(req.params.id, paymentMethod);
  res.status(200).json({
    success: true,
    message: 'Bill paid successfully',
    data: bill,
  });
});

/**
 * @desc    Delete/Void a bill
 * @route   DELETE /api/bills/:id
 * @access  Private/Admin
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await billService.deleteBill(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Bill deleted/voided successfully',
  });
});
