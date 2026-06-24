import mongoose, { Schema, Document } from 'mongoose';

/**
 * TypeScript interface representing a Table document in MongoDB.
 * Tables represent physical dining tables in the restaurant.
 */
export interface ITable extends Document {
  tableNumber: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema: Schema<ITable> = new Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      unique: true,
      min: [1, 'Table number must be at least 1'],
    },
    capacity: {
      type: Number,
      required: [true, 'Table capacity is required'],
      min: [1, 'Table must have at least 1 seat'],
      max: [20, 'Table capacity cannot exceed 20 seats'],
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'occupied', 'reserved'],
        message: 'Status must be one of: available, occupied, reserved',
      },
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick availability filtering
TableSchema.index({ status: 1 });

const Table = mongoose.model<ITable>('Table', TableSchema);

export default Table;
