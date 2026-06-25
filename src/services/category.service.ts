import Category, { ICategory } from '../models/category.model';
import { ApiError } from '../utils/api-error';
import { validateObjectId } from '../utils/validation.util';

/**
 * Service: Create a new menu category.
 */
export const createCategory = async (data: { name: string; description?: string }): Promise<ICategory> => {
  const { name, description } = data;

  if (!name || name.trim() === '') {
    throw ApiError.badRequest('Category name is required');
  }

  // Check for duplicate name
  const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  if (existingCategory) {
    throw ApiError.badRequest(`Category with name '${name}' already exists`);
  }

  const category = await Category.create({ name: name.trim(), description });
  return category;
};

/**
 * Service: Get all categories.
 *
 * @param filterActive If true, only retrieves active categories.
 */
export const getAllCategories = async (filterActive: boolean = false): Promise<ICategory[]> => {
  const query: any = {};
  if (filterActive) {
    query.isActive = true;
  }
  return Category.find(query).sort({ name: 1 });
};

/**
 * Service: Get a single category by ID.
 */
export const getCategoryById = async (id: string): Promise<ICategory> => {
  validateObjectId(id, 'Category');
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound(`Category with ID '${id}' not found`);
  }
  return category;
};

/**
 * Service: Update a category by ID.
 */
export const updateCategory = async (
  id: string,
  data: { name?: string; description?: string; isActive?: boolean }
): Promise<ICategory> => {
  validateObjectId(id, 'Category');
  const category = await getCategoryById(id);

  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (trimmedName === '') {
      throw ApiError.badRequest('Category name cannot be empty');
    }

    // Check if name is already taken by another category
    const duplicateCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      _id: { $ne: id },
    });
    if (duplicateCategory) {
      throw ApiError.badRequest(`Another category with name '${trimmedName}' already exists`);
    }
    category.name = trimmedName;
  }

  if (data.description !== undefined) {
    category.description = data.description;
  }

  if (data.isActive !== undefined) {
    category.isActive = data.isActive;
  }

  await category.save();
  return category;
};

/**
 * Service: Delete a category by ID.
 */
export const deleteCategory = async (id: string): Promise<void> => {
  validateObjectId(id, 'Category');
  const result = await Category.findByIdAndDelete(id);
  if (!result) {
    throw ApiError.notFound(`Category with ID '${id}' not found`);
  }
};
