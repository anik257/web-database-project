import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * TypeScript interface representing a MenuItem document in MongoDB.
 * Each MenuItem belongs to a Category (many-to-one relationship).
 */
export interface IMenuItem extends Document {
  name: string;
  description?: string;
  price: number;
  category: Types.ObjectId;
  availability: boolean;
  image?: string;
  preparationTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema: Schema<IMenuItem> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Menu item name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required for a menu item'],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      trim: true,
    },
    preparationTime: {
      type: Number,
      default: 15,
      min: [1, 'Preparation time must be at least 1 minute'],
      max: [180, 'Preparation time cannot exceed 180 minutes'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ availability: 1 });
MenuItemSchema.index({ price: 1 });

const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
