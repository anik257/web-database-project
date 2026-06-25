import Bill, { IBill } from '../models/bill.model';
import Order from '../models/order.model';
import Table from '../models/table.model';
import { ApiError } from '../utils/api-error';
import { validateObjectId } from '../utils/validation.util';

/**
 * Service: Generate a new Bill for a given Order.
 */
export const generateBill = async (
  data: {
    orderId: string;
  }
): Promise<IBill> => {
  const { orderId } = data;

  if (!orderId) {
    throw ApiError.badRequest('Order reference (orderId) is required');
  }

  validateObjectId(orderId, 'Order');

  // 1. Verify order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound(`Order with ID '${orderId}' not found`);
  }

  // 2. Check if a bill is already generated for this order
  const existingBill = await Bill.findOne({ orderId });
  if (existingBill) {
    throw ApiError.badRequest(`A bill has already been generated for Order ID '${orderId}'`);
  }

  // 3. Create the Bill
  const bill = await Bill.create({
    orderId: order._id as any,
    amount: order.totalAmount,
    paymentMethod: 'Unpaid',
    paymentStatus: 'Pending',
  });

  const populatedBill = await bill.populate([
    { path: 'orderId', populate: { path: 'tableId', select: 'tableNumber' } },
  ]);

  return populatedBill;
};

/**
 * Service: Get all bills with filters.
 */
export const getAllBills = async (filters: { paymentStatus?: string; paymentMethod?: string }): Promise<IBill[]> => {
  const query: any = {};
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }

  return Bill.find(query)
    .populate([
      { path: 'orderId', populate: { path: 'tableId staffId', select: 'tableNumber name phone position' } },
    ])
    .sort({ createdAt: -1 });
};

/**
 * Service: Get bill by ID.
 */
export const getBillById = async (id: string): Promise<IBill> => {
  validateObjectId(id, 'Bill');
  const bill = await Bill.findById(id).populate([
    { path: 'orderId', populate: { path: 'tableId staffId', select: 'tableNumber capacity name phone position' } },
  ]);

  if (!bill) {
    throw ApiError.notFound(`Bill with ID '${id}' not found`);
  }
  return bill;
};

/**
 * Service: Process payment for a bill.
 * Marks the bill as paid, completes the order, and frees up the table.
 */
export const payBill = async (
  id: string,
  paymentMethod: 'Cash' | 'Card' | 'Mobile Banking'
): Promise<IBill> => {
  validateObjectId(id, 'Bill');

  const validMethods = ['Cash', 'Card', 'Mobile Banking'];
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    throw ApiError.badRequest(`Payment method must be one of: ${validMethods.join(', ')}`);
  }

  // 1. Verify bill exists
  const bill = await Bill.findById(id);
  if (!bill) {
    throw ApiError.notFound(`Bill with ID '${id}' not found`);
  }

  if (bill.paymentStatus === 'Paid') {
    throw ApiError.badRequest('This bill is already paid');
  }

  // 2. Complete payment on Bill
  bill.paymentStatus = 'Paid';
  bill.paymentMethod = paymentMethod;
  await bill.save();

  // 3. Complete associated Order
  const order = await Order.findById(bill.orderId);
  if (order) {
    order.status = 'Paid';
    await order.save();

    // 4. Free up physical Table
    const table = await Table.findById(order.tableId);
    if (table) {
      // Check if there are other active orders on the same table
      const activeOrders = await Order.findOne({
        tableId: table._id,
        _id: { $ne: order._id },
        status: { $in: ['Pending', 'Preparing', 'Ready', 'Served'] },
      });
      if (!activeOrders) {
        table.status = 'available';
        await table.save();
      }
    }
  }

  const populatedBill = await bill.populate([
    { path: 'orderId', populate: { path: 'tableId', select: 'tableNumber' } },
  ]);

  return populatedBill;
};

/**
 * Service: Void/Delete a bill.
 * Admin only.
 */
export const deleteBill = async (id: string): Promise<void> => {
  validateObjectId(id, 'Bill');
  const bill = await Bill.findById(id);
  if (!bill) {
    throw ApiError.notFound(`Bill with ID '${id}' not found`);
  }

  // If order was marked paid, revert order status back to Served
  const order = await Order.findById(bill.orderId);
  if (order && order.status === 'Paid') {
    order.status = 'Served'; // Revert back to served status
    await order.save();
  }

  await Bill.findByIdAndDelete(id);
};
