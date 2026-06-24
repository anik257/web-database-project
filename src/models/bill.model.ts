import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * TypeScript interface representing a Bill document in MongoDB.
 * Each Bill is linked to exactly one Order (one-to-one) and records
 * payment details including tax, discount, and the cashier who generated it.
 */
export interface IBill extends Document {
  order: Types.ObjectId;
  subTotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mobile_pay' | 'unpaid';
  paymentStatus: 'pending' | 'paid';
  generatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema: Schema<IBill> = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
      unique: true, // Enforces one-to-one: one bill per order
    },
    subTotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      required: [true, 'Tax amount is required'],
      min: [0, 'Tax cannot be negative'],
      default: 0,
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'card', 'mobile_pay', 'unpaid'],
        message: 'Payment method must be one of: cash, card, mobile_pay, unpaid',
      },
      default: 'unpaid',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid'],
        message: 'Payment status must be one of: pending, paid',
      },
      default: 'pending',
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier (User) reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
BillSchema.index({ paymentStatus: 1 });
BillSchema.index({ paymentMethod: 1 });
BillSchema.index({ createdAt: -1 }); // Most recent bills first

const Bill = mongoose.model<IBill>('Bill', BillSchema);

export default Bill;
