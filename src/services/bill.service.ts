import Bill, { IBill } from '../models/bill.model';
import Order from '../models/order.model';
import Table from '../models/table.model';
import { ApiError } from '../utils/api-error';
import { validateObjectId } from '../utils/validation.util';

/**
 * Service: Generate a new Bill for a given Order.
 */
export const generateBill = async (
  cashierId: string,
  data: {
    order: string;
    tax?: number; // tax rate in percentage (e.g., 10 for 10%)
    discount?: number; // absolute discount amount
  }
): Promise<IBill> => {
  const { order: orderId, tax: taxRateInput, discount: discountInput } = data;

  if (!orderId) {
    throw ApiError.badRequest('Order reference is required');
  }

  validateObjectId(orderId, 'Order');
  validateObjectId(cashierId, 'Cashier');

  // 1. Verify order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound(`Order with ID '${orderId}' not found`);
  }

  // 2. Check if a bill is already generated for this order
  const existingBill = await Bill.findOne({ order: orderId });
  if (existingBill) {
    throw ApiError.badRequest(`A bill has already been generated for Order ID '${orderId}'`);
  }

  // 3. Perform billing calculations
  const subTotal = order.totalAmount;
  const taxRate = taxRateInput !== undefined ? Number(taxRateInput) : 10; // Default tax 10%
  if (isNaN(taxRate) || taxRate < 0) {
    throw ApiError.badRequest('Tax rate cannot be negative');
  }

  const tax = Number(((taxRate / 100) * subTotal).toFixed(2));
  const discount = discountInput !== undefined ? Number(discountInput) : 0;
  if (isNaN(discount) || discount < 0) {
    throw ApiError.badRequest('Discount cannot be negative');
  }
  if (discount > subTotal + tax) {
    throw ApiError.badRequest('Discount cannot exceed the subtotal + tax amount');
  }

  const totalAmount = Number((subTotal + tax - discount).toFixed(2));

  // 4. Create the Bill
  const bill = await Bill.create({
    order: order._id as any,
    subTotal,
    tax,
    discount,
    totalAmount,
    paymentMethod: 'unpaid',
    paymentStatus: 'pending',
    generatedBy: cashierId as any,
  });

  const populatedBill = await bill.populate([
    { path: 'order', populate: { path: 'tableId', select: 'tableNumber' } },
    { path: 'generatedBy', select: 'name email' },
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
      { path: 'order', populate: { path: 'tableId staffId', select: 'tableNumber name phone position' } },
      { path: 'generatedBy', select: 'name email' },
    ])
    .sort({ createdAt: -1 });
};

/**
 * Service: Get bill by ID.
 */
export const getBillById = async (id: string): Promise<IBill> => {
  validateObjectId(id, 'Bill');
  const bill = await Bill.findById(id).populate([
    { path: 'order', populate: { path: 'tableId staffId', select: 'tableNumber capacity name phone position' } },
    { path: 'generatedBy', select: 'name email' },
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
  paymentMethod: 'cash' | 'card' | 'mobile_pay'
): Promise<IBill> => {
  validateObjectId(id, 'Bill');

  if (!paymentMethod || !['cash', 'card', 'mobile_pay'].includes(paymentMethod)) {
    throw ApiError.badRequest("Payment method must be one of: 'cash', 'card', 'mobile_pay'");
  }

  // 1. Verify bill exists
  const bill = await Bill.findById(id);
  if (!bill) {
    throw ApiError.notFound(`Bill with ID '${id}' not found`);
  }

  if (bill.paymentStatus === 'paid') {
    throw ApiError.badRequest('This bill is already paid');
  }

  // 2. Complete payment on Bill
  bill.paymentStatus = 'paid';
  bill.paymentMethod = paymentMethod;
  await bill.save();

  // 3. Complete associated Order
  const order = await Order.findById(bill.order);
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
    { path: 'order', populate: { path: 'tableId', select: 'tableNumber' } },
    { path: 'generatedBy', select: 'name email' },
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
  const order = await Order.findById(bill.order);
  if (order && order.status === 'Paid') {
    order.status = 'Served'; // Revert back to served status
    await order.save();
  }

  await Bill.findByIdAndDelete(id);
};
