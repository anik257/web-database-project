import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * TypeScript interface representing a Staff document in MongoDB.
 * Staff is linked to a User via the 'user' reference field.
 */
export interface IStaff extends Document {
  user: Types.ObjectId;
  designation: string;
  salary: number;
  shift: 'morning' | 'evening' | 'night';
  hireDate: Date;
  status: 'active' | 'suspended' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema: Schema<IStaff> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff must be linked to a User account'],
      unique: true, // One-to-one relationship: one User → one Staff profile
    },
    designation: {
      type: String,
      required: [true, 'Staff designation is required'],
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    shift: {
      type: String,
      enum: {
        values: ['morning', 'evening', 'night'],
        message: 'Shift must be one of: morning, evening, night',
      },
      required: [true, 'Shift is required'],
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'terminated'],
        message: 'Status must be one of: active, suspended, terminated',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups by status and shift
StaffSchema.index({ status: 1 });
StaffSchema.index({ shift: 1 });

const Staff = mongoose.model<IStaff>('Staff', StaffSchema);

export default Staff;
