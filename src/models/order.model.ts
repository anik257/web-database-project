import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * TypeScript interface representing an individual order item (sub-document).
 */
export interface IOrderItem {
  foodId: Types.ObjectId;
  quantity: number;
  price: number; // Snapshot of the price at the time of ordering
  subtotal: number; // price * quantity
  notes?: string;
}

/**
 * TypeScript interface representing an Order document in MongoDB.
 */
export interface IOrder extends Document {
  tableId: Types.ObjectId;
  staffId: Types.ObjectId;
  items: IOrderItem[];
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Cancelled';
  totalAmount: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema(
  {
    foodId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: [true, 'Food item reference is required'],
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
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Item notes cannot exceed 200 characters'],
    },
  },
  {
    _id: false,
  }
);

const OrderSchema: Schema<IOrder> = new Schema(
  {
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table reference is required'],
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Staff reference is required'],
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
        values: ['Pending', 'Preparing', 'Ready', 'Served', 'Paid', 'Cancelled'],
        message: 'Status must be one of: Pending, Preparing, Ready, Served, Paid, Cancelled',
      },
      default: 'Pending',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
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
OrderSchema.index({ tableId: 1 });
OrderSchema.index({ staffId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
