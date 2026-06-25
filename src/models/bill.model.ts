import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * TypeScript interface representing a Bill document in MongoDB.
 */
export interface IBill extends Document {
  orderId: Types.ObjectId;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'Mobile Banking' | 'Unpaid';
  paymentStatus: 'Pending' | 'Paid';
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema: Schema<IBill> = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
      unique: true, // One-to-one mapping
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['Cash', 'Card', 'Mobile Banking', 'Unpaid'],
        message: 'Payment method must be one of: Cash, Card, Mobile Banking, Unpaid',
      },
      default: 'Unpaid',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Paid'],
        message: 'Payment status must be one of: Pending, Paid',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
BillSchema.index({ paymentStatus: 1 });
BillSchema.index({ paymentMethod: 1 });
BillSchema.index({ createdAt: -1 });

const Bill = mongoose.model<IBill>('Bill', BillSchema);

export default Bill;
