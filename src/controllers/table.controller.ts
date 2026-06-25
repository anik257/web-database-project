import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.middleware';
import * as tableService from '../services/table.service';

/**
 * @desc    Create a table
 * @route   POST /api/tables
 * @access  Private/Admin
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const table = await tableService.createTable(req.body);
  res.status(201).json({
    success: true,
    message: 'Table created successfully',
    data: table,
  });
});

/**
 * @desc    Get all tables
 * @route   GET /api/tables
 * @access  Private/Staff
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as 'available' | 'occupied' | 'reserved' | undefined;
  const tables = await tableService.getAllTables({ status });
  res.status(200).json({
    success: true,
    count: tables.length,
    data: tables,
  });
});

/**
 * @desc    Get a table by ID
 * @route   GET /api/tables/:id
 * @access  Private/Staff
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const table = await tableService.getTableById(req.params.id);
  res.status(200).json({
    success: true,
    data: table,
  });
});

/**
 * @desc    Update a table
 * @route   PUT /api/tables/:id
 * @access  Private/Staff
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  // Safe cast because protect middleware guarantees req.user is set
  const userRole = req.user!.role;
  const table = await tableService.updateTable(req.params.id, req.body, userRole);
  res.status(200).json({
    success: true,
    message: 'Table updated successfully',
    data: table,
  });
});

/**
 * @desc    Delete a table
 * @route   DELETE /api/tables/:id
 * @access  Private/Admin
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await tableService.deleteTable(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Table deleted successfully',
  });
});
