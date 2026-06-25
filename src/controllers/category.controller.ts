import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.middleware';
import * as categoryService from '../services/category.service';

/**
 * @desc    Create a category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Private/Staff
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const filterActive = req.query.active === 'true';
  const categories = await categoryService.getAllCategories(filterActive);
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

/**
 * @desc    Get a category by ID
 * @route   GET /api/v1/categories/:id
 * @access  Private/Staff
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Update a category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});
