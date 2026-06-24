import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * TypeScript interface representing an individual order item (sub-document).
 */
export interface IOrderItem {
  menuItem: Types.ObjectId;
  quantity: number;
  price: number; // Snapshot of the price at the time of ordering
  notes?: string;
}

/**
 * TypeScript interface representing an Order document in MongoDB.
 * An Order references a Table and a waiter (User), and embeds an array of OrderItems.
 */
export interface IOrder extends Document {
  table: Types.ObjectId;
  waiter: Types.ObjectId;
  items: IOrderItem[];
  status: 'pending' | 'preparing' | 'served' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: [true, 'Menu item reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price snapshot is required'],
      min: [0, 'Price cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Item notes cannot exceed 200 characters'],
    },
  },
  {
    _id: false, // No separate _id for sub-documents
  }
);

const OrderSchema: Schema<IOrder> = new Schema(
  {
    table: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table reference is required'],
    },
    waiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Waiter (User) reference is required'],
    },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'An order must contain at least one item',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'preparing', 'served', 'completed', 'cancelled'],
        message: 'Status must be one of: pending, preparing, served, completed, cancelled',
      },
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid'],
        message: 'Payment status must be one of: pending, paid',
      },
      default: 'pending',
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Special instructions cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
OrderSchema.index({ table: 1 });
OrderSchema.index({ waiter: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 }); // Most recent orders first

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
