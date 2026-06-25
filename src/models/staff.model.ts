import mongoose, { Schema, Document } from 'mongoose';

/**
 * TypeScript interface representing a Staff document in MongoDB.
 */
export interface IStaff extends Document {
  name: string;
  phone: string;
  position: 'Manager' | 'Waiter' | 'Chef' | 'Cashier';
  salary: number;
  joiningDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema: Schema<IStaff> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    position: {
      type: String,
      enum: {
        values: ['Manager', 'Waiter', 'Chef', 'Cashier'],
        message: 'Position must be one of: Manager, Waiter, Chef, Cashier',
      },
      required: [true, 'Position is required'],
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
StaffSchema.index({ position: 1 });
StaffSchema.index({ joiningDate: -1 });

const Staff = mongoose.model<IStaff>('Staff', StaffSchema);

export default Staff;
