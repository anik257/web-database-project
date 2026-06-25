import Order, { IOrder, IOrderItem } from '../models/order.model';
import Table from '../models/table.model';
import Staff from '../models/staff.model';
import MenuItem from '../models/menu-item.model';
import { ApiError } from '../utils/api-error';
import { validateObjectId } from '../utils/validation.util';

/**
 * Service: Create a new order.
 * Validates table & items, captures pricing snapshots, updates table status.
 */
export const createOrder = async (
  data: {
    tableId: string;
    staffId: string;
    items: { foodId: string; quantity: number; notes?: string }[];
    specialInstructions?: string;
  }
): Promise<IOrder> => {
  const { tableId, staffId, items: requestItems, specialInstructions } = data;

  // 1. Validations
  if (!tableId) {
    throw ApiError.badRequest('Table reference (tableId) is required');
  }
  if (!staffId) {
    throw ApiError.badRequest('Staff reference (staffId) is required');
  }
  if (!requestItems || !Array.isArray(requestItems) || requestItems.length === 0) {
    throw ApiError.badRequest('Order items are required and must not be empty');
  }

  validateObjectId(tableId, 'Table');
  validateObjectId(staffId, 'Staff');

  // Verify table exists
  const table = await Table.findById(tableId);
  if (!table) {
    throw ApiError.notFound(`Table with ID '${tableId}' not found`);
  }

  // Verify staff exists
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw ApiError.notFound(`Staff with ID '${staffId}' not found`);
  }

  // 2. Process items and calculate subtotals and total
  const orderItems: IOrderItem[] = [];
  let calculatedTotal = 0;

  for (const item of requestItems) {
    if (!item.foodId) {
      throw ApiError.badRequest('Each order item must specify a foodId');
    }
    validateObjectId(item.foodId, 'MenuItem');

    const qty = Number(item.quantity);
    if (isNaN(qty) || qty < 1) {
      throw ApiError.badRequest(`Quantity for food item '${item.foodId}' must be at least 1`);
    }

    const menuItem = await MenuItem.findById(item.foodId);
    if (!menuItem) {
      throw ApiError.notFound(`MenuItem with ID '${item.foodId}' not found`);
    }

    if (!menuItem.availability) {
      throw ApiError.badRequest(`Menu item '${menuItem.name}' is currently unavailable`);
    }

    const snapshotPrice = menuItem.price;
    const itemSubtotal = Number((snapshotPrice * qty).toFixed(2));
    calculatedTotal += itemSubtotal;

    orderItems.push({
      foodId: menuItem._id as any,
      quantity: qty,
      price: snapshotPrice,
      subtotal: itemSubtotal,
      notes: item.notes,
    });
  }

  calculatedTotal = Number(calculatedTotal.toFixed(2));

  // 3. Create the Order
  const order = await Order.create({
    tableId: table._id as any,
    staffId: staff._id as any,
    items: orderItems,
    status: 'Pending',
    totalAmount: calculatedTotal,
    specialInstructions,
  });

  // 4. Update Table status to 'occupied'
  table.status = 'occupied';
  await table.save();

  return order;
};

/**
 * Service: Get all orders with filter criteria.
 */
export const getAllOrders = async (filters: {
  status?: string;
  tableId?: string;
  staffId?: string;
}): Promise<IOrder[]> => {
  const query: any = {};

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.tableId) {
    validateObjectId(filters.tableId, 'Table');
    query.tableId = filters.tableId;
  }
  if (filters.staffId) {
    validateObjectId(filters.staffId, 'Staff');
    query.staffId = filters.staffId;
  }

  return Order.find(query)
    .populate('tableId', 'tableNumber capacity')
    .populate('staffId', 'name phone position')
    .populate('items.foodId', 'name price image')
    .sort({ createdAt: -1 });
};

/**
 * Service: Get single Order by ID.
 */
export const getOrderById = async (id: string): Promise<IOrder> => {
  validateObjectId(id, 'Order');
  const order = await Order.findById(id)
    .populate('tableId', 'tableNumber capacity status')
    .populate('staffId', 'name phone position')
    .populate('items.foodId', 'name price category image');

  if (!order) {
    throw ApiError.notFound(`Order with ID '${id}' not found`);
  }
  return order;
};

/**
 * Service: Update Order details (status or items).
 * Recalculates amount if items are modified.
 */
export const updateOrder = async (
  id: string,
  data: {
    status?: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Cancelled';
    items?: { foodId: string; quantity: number; notes?: string }[];
    specialInstructions?: string;
  }
): Promise<IOrder> => {
  validateObjectId(id, 'Order');
  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound(`Order with ID '${id}' not found`);
  }

  // If status is updated
  if (data.status !== undefined) {
    order.status = data.status;

    // Side-effects on Table status based on status transitions
    if (data.status === 'Cancelled' || data.status === 'Paid') {
      const table = await Table.findById(order.tableId);
      if (table) {
        // Only set table to available if there are no other active orders on this table
        const otherActiveOrders = await Order.findOne({
          tableId: table._id,
          _id: { $ne: order._id },
          status: { $in: ['Pending', 'Preparing', 'Ready', 'Served'] },
        });
        if (!otherActiveOrders) {
          table.status = 'available';
          await table.save();
        }
      }
    } else if (['Pending', 'Preparing', 'Ready', 'Served'].includes(data.status)) {
      // Re-occupy table if order is put back to active
      const table = await Table.findById(order.tableId);
      if (table && table.status === 'available') {
        table.status = 'occupied';
        await table.save();
      }
    }
  }

  // If items are modified, recalculate amount
  if (data.items !== undefined && Array.isArray(data.items)) {
    if (data.items.length === 0) {
      throw ApiError.badRequest('An order must contain at least one item');
    }

    const orderItems: IOrderItem[] = [];
    let calculatedTotal = 0;

    for (const item of data.items) {
      if (!item.foodId) {
        throw ApiError.badRequest('Each order item must specify a foodId');
      }
      validateObjectId(item.foodId, 'MenuItem');
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty < 1) {
        throw ApiError.badRequest('Quantity must be at least 1');
      }

      const menuItem = await MenuItem.findById(item.foodId);
      if (!menuItem) {
        throw ApiError.notFound(`MenuItem with ID '${item.foodId}' not found`);
      }

      const snapshotPrice = menuItem.price;
      const itemSubtotal = Number((snapshotPrice * qty).toFixed(2));
      calculatedTotal += itemSubtotal;

      orderItems.push({
        foodId: menuItem._id as any,
        quantity: qty,
        price: snapshotPrice,
        subtotal: itemSubtotal,
        notes: item.notes,
      });
    }

    order.items = orderItems;
    order.totalAmount = Number(calculatedTotal.toFixed(2));
  }

  if (data.specialInstructions !== undefined) {
    order.specialInstructions = data.specialInstructions;
  }

  await order.save();
  return order;
};

/**
 * Service: Delete Order by ID.
 * Frees up table if the deleted order was active.
 */
export const deleteOrder = async (id: string): Promise<void> => {
  validateObjectId(id, 'Order');
  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound(`Order with ID '${id}' not found`);
  }

  const table = await Table.findById(order.tableId);

  await Order.findByIdAndDelete(id);

  if (table) {
    const otherActiveOrders = await Order.findOne({
      tableId: table._id,
      status: { $in: ['Pending', 'Preparing', 'Ready', 'Served'] },
    });
    if (!otherActiveOrders) {
      table.status = 'available';
      await table.save();
    }
  }
};
