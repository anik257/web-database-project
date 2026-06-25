import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.middleware';
import * as menuItemService from '../services/menu-item.service';

/**
 * @desc    Create a menu item
 * @route   POST /api/menu
 * @access  Private/Admin
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const menuItem = await menuItemService.createMenuItem(req.body);
  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: menuItem,
  });
});

/**
 * @desc    Get all menu items
 * @route   GET /api/menu
 * @access  Public/Authenticated
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const category = req.query.category ? String(req.query.category) : undefined;
  const availability = req.query.availability !== undefined ? req.query.availability === 'true' : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;
  
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const result = await menuItemService.getAllMenuItems(
    { category, availability, search },
    { page, limit }
  );

  res.status(200).json({
    success: true,
    count: result.items.length,
    total: result.total,
    page: result.page,
    pages: result.pages,
    data: result.items,
  });
});

/**
 * @desc    Get a menu item by ID
 * @route   GET /api/menu/:id
 * @access  Public/Authenticated
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const menuItem = await menuItemService.getMenuItemById(req.params.id);
  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

/**
 * @desc    Update a menu item
 * @route   PUT /api/menu/:id
 * @access  Private/Admin
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const menuItem = await menuItemService.updateMenuItem(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: menuItem,
  });
});

/**
 * @desc    Delete a menu item
 * @route   DELETE /api/menu/:id
 * @access  Private/Admin
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await menuItemService.deleteMenuItem(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully',
  });
});
