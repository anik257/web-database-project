import MenuItem, { IMenuItem } from '../models/menu-item.model';
import Category from '../models/category.model';
import { ApiError } from '../utils/api-error';
import { validateObjectId } from '../utils/validation.util';

/**
 * Service: Create a new menu item.
 * Verifies that the associated category exists.
 */
export const createMenuItem = async (data: {
  name: string;
  description?: string;
  price: number;
  category: string;
  availability?: boolean;
  image?: string;
  preparationTime?: number;
}): Promise<IMenuItem> => {
  const { name, description, price, category, availability, image, preparationTime } = data;

  if (!name || name.trim() === '') {
    throw ApiError.badRequest('Menu item name is required');
  }

  if (price === undefined || price < 0) {
    throw ApiError.badRequest('Price is required and cannot be negative');
  }

  if (!category) {
    throw ApiError.badRequest('Category reference is required');
  }

  // Validate Category ObjectId
  validateObjectId(category, 'Category');

  // Verify category exists and is active
  const existingCategory = await Category.findById(category);
  if (!existingCategory) {
    throw ApiError.notFound(`Category with ID '${category}' not found`);
  }

  // Check for duplicate name
  const existingItem = await MenuItem.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  if (existingItem) {
    throw ApiError.badRequest(`MenuItem with name '${name}' already exists`);
  }

  const menuItem = await MenuItem.create({
    name: name.trim(),
    description,
    price,
    category,
    availability: availability !== undefined ? availability : true,
    image,
    preparationTime,
  });

  return menuItem;
};

/**
 * Service: Get all menu items with filters, search, and pagination.
 */
export const getAllMenuItems = async (
  filters: {
    category?: string;
    availability?: boolean;
    search?: string;
  },
  pagination: {
    page: number;
    limit: number;
  }
): Promise<{ items: IMenuItem[]; total: number; page: number; pages: number }> => {
  const query: any = {};

  if (filters.category) {
    validateObjectId(filters.category, 'Category');
    query.category = filters.category;
  }

  if (filters.availability !== undefined) {
    query.availability = filters.availability;
  }

  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    MenuItem.find(query)
      .populate('category', 'name')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    MenuItem.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

/**
 * Service: Get MenuItem by ID.
 */
export const getMenuItemById = async (id: string): Promise<IMenuItem> => {
  validateObjectId(id, 'MenuItem');
  const menuItem = await MenuItem.findById(id).populate('category', 'name');
  if (!menuItem) {
    throw ApiError.notFound(`MenuItem with ID '${id}' not found`);
  }
  return menuItem;
};

/**
 * Service: Update MenuItem by ID.
 * Verifies category exists if provided.
 */
export const updateMenuItem = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    availability?: boolean;
    image?: string;
    preparationTime?: number;
  }
): Promise<IMenuItem> => {
  validateObjectId(id, 'MenuItem');
  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    throw ApiError.notFound(`MenuItem with ID '${id}' not found`);
  }

  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (trimmedName === '') {
      throw ApiError.badRequest('Name cannot be empty');
    }

    const duplicateItem = await MenuItem.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      _id: { $ne: id },
    });
    if (duplicateItem) {
      throw ApiError.badRequest(`Another MenuItem with name '${trimmedName}' already exists`);
    }
    menuItem.name = trimmedName;
  }

  if (data.price !== undefined) {
    if (data.price < 0) {
      throw ApiError.badRequest('Price cannot be negative');
    }
    menuItem.price = data.price;
  }

  if (data.category !== undefined) {
    validateObjectId(data.category, 'Category');
    const existingCategory = await Category.findById(data.category);
    if (!existingCategory) {
      throw ApiError.notFound(`Category with ID '${data.category}' not found`);
    }
    menuItem.category = existingCategory._id as any;
  }

  if (data.description !== undefined) {
    menuItem.description = data.description;
  }

  if (data.availability !== undefined) {
    menuItem.availability = data.availability;
  }

  if (data.image !== undefined) {
    menuItem.image = data.image;
  }

  if (data.preparationTime !== undefined) {
    menuItem.preparationTime = data.preparationTime;
  }

  await menuItem.save();
  return menuItem;
};

/**
 * Service: Delete MenuItem by ID.
 */
export const deleteMenuItem = async (id: string): Promise<void> => {
  validateObjectId(id, 'MenuItem');
  const result = await MenuItem.findByIdAndDelete(id);
  if (!result) {
    throw ApiError.notFound(`MenuItem with ID '${id}' not found`);
  }
};
