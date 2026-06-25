import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.middleware';
import * as staffService from '../services/staff.service';

/**
 * @desc    Create a new staff profile
 * @route   POST /api/staff
 * @access  Private/Admin
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.createStaff(req.body);
  res.status(201).json({
    success: true,
    message: 'Staff profile created successfully',
    data: staff,
  });
});

/**
 * @desc    Get all staff profiles
 * @route   GET /api/staff
 * @access  Private/Admin
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    position: req.query.position ? String(req.query.position) : undefined,
  };

  const staffList = await staffService.getAllStaff(filters);
  res.status(200).json({
    success: true,
    count: staffList.length,
    data: staffList,
  });
});

/**
 * @desc    Get staff profile by ID
 * @route   GET /api/staff/:id
 * @access  Private/Admin
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.getStaffById(req.params.id);
  res.status(200).json({
    success: true,
    data: staff,
  });
});

/**
 * @desc    Update a staff profile
 * @route   PUT /api/staff/:id
 * @access  Private/Admin
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.updateStaff(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Staff details updated successfully',
    data: staff,
  });
});

/**
 * @desc    Delete a staff profile
 * @route   DELETE /api/staff/:id
 * @access  Private/Admin
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await staffService.deleteStaff(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Staff profile deleted successfully',
  });
});
