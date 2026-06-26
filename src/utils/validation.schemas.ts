import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Custom Zod schema to validate MongoDB ObjectId.
 */
export const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid MongoDB ObjectId format',
  });

/**
 * Custom Zod schema to validate phone numbers.
 * Matches: optional '+' followed by 1 to 14 digits (first digit not 0)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number',
  });

// ==========================================
// 1. Auth Schemas
// ==========================================
export const registerBodySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name cannot exceed 50 characters' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Please provide a valid email address' })
    .lowercase()
    .trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  phoneNumber: phoneSchema.optional(),
  role: z
    .enum(['admin', 'manager', 'staff', 'customer'], {
      message: 'Role must be one of: admin, manager, staff, customer',
    })
    .default('customer'),
  isActive: z.boolean().optional(),
});

export const loginBodySchema = z.object({
  email: z
    .string()
    .email({ message: 'Please provide a valid email address' })
    .lowercase()
    .trim(),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

// ==========================================
// 2. Category Schemas
// ==========================================
export const createCategoryBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Category name is required' })
    .max(50, { message: 'Category name cannot exceed 50 characters' })
    .trim(),
  description: z
    .string()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .trim()
    .optional(),
  isActive: z.boolean().optional(),
});

export const updateCategoryBodySchema = createCategoryBodySchema.partial();

// ==========================================
// 3. Menu Item (Menu) Schemas
// ==========================================
export const createMenuItemBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Menu item name is required' })
    .max(100, { message: 'Menu item name cannot exceed 100 characters' })
    .trim(),
  description: z
    .string()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .trim()
    .optional(),
  price: z
    .number({ message: 'Price is required' })
    .nonnegative({ message: 'Price cannot be negative' }),
  category: objectIdSchema,
  availability: z.boolean().optional(),
  image: z.string().trim().optional(),
  preparationTime: z
    .number()
    .min(1, { message: 'Preparation time must be at least 1 minute' })
    .max(180, { message: 'Preparation time cannot exceed 180 minutes' })
    .optional(),
});

export const updateMenuItemBodySchema = createMenuItemBodySchema.partial();

// ==========================================
// 4. Table Schemas
// ==========================================
export const createTableBodySchema = z.object({
  tableNumber: z
    .number({ message: 'Table number is required' })
    .int()
    .min(1, { message: 'Table number must be at least 1' }),
  capacity: z
    .number({ message: 'Table capacity is required' })
    .int()
    .min(1, { message: 'Table must have at least 1 seat' })
    .max(20, { message: 'Table capacity cannot exceed 20 seats' }),
  status: z
    .enum(['available', 'occupied', 'reserved'], {
      message: 'Status must be one of: available, occupied, reserved',
    })
    .optional(),
});

export const updateTableBodySchema = createTableBodySchema.partial();

// ==========================================
// 5. Order Schemas
// ==========================================
const orderItemSchema = z.object({
  foodId: objectIdSchema,
  quantity: z
    .number({ message: 'Quantity is required' })
    .int()
    .min(1, { message: 'Quantity must be at least 1' }),
  notes: z
    .string()
    .max(200, { message: 'Item notes cannot exceed 200 characters' })
    .trim()
    .optional(),
});

export const createOrderBodySchema = z.object({
  tableId: objectIdSchema,
  staffId: objectIdSchema,
  items: z
    .array(orderItemSchema)
    .min(1, { message: 'An order must contain at least one item' }),
  specialInstructions: z
    .string()
    .max(500, { message: 'Special instructions cannot exceed 500 characters' })
    .trim()
    .optional(),
});

export const updateOrderBodySchema = z.object({
  status: z
    .enum(['Pending', 'Preparing', 'Ready', 'Served', 'Paid', 'Cancelled'], {
      message: 'Status must be one of: Pending, Preparing, Ready, Served, Paid, Cancelled',
    })
    .optional(),
  items: z
    .array(orderItemSchema)
    .min(1, { message: 'An order must contain at least one item' })
    .optional(),
  specialInstructions: z
    .string()
    .max(500, { message: 'Special instructions cannot exceed 500 characters' })
    .trim()
    .optional(),
});

// ==========================================
// 6. Staff Schemas
// ==========================================
export const createStaffBodySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' })
    .trim(),
  phone: phoneSchema,
  position: z.enum(['Manager', 'Waiter', 'Chef', 'Cashier'], {
    message: 'Position must be one of: Manager, Waiter, Chef, Cashier',
  }),
  salary: z
    .number({ message: 'Salary is required' })
    .nonnegative({ message: 'Salary cannot be negative' }),
  joiningDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
});

export const updateStaffBodySchema = createStaffBodySchema.partial();

// ==========================================
// 7. Billing Schemas
// ==========================================
export const generateBillBodySchema = z.object({
  orderId: objectIdSchema,
});

export const payBillBodySchema = z.object({
  paymentMethod: z.enum(['Cash', 'Card', 'Mobile Banking'], {
    message: 'Payment method must be one of: Cash, Card, Mobile Banking',
  }),
});

// ==========================================
// 8. Params Validation Schemas
// ==========================================
export const idParamSchema = z.object({
  id: objectIdSchema,
});
