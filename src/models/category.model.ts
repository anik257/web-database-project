import mongoose, { Schema, Document } from 'mongoose';

/**
 * TypeScript interface representing a Category document in MongoDB.
 * Categories group MenuItems (e.g., Appetizers, Main Course, Desserts, Drinks).
 */
export interface ICategory extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for alphabetical listing and active filtering
CategorySchema.index({ name: 1 });
CategorySchema.index({ isActive: 1 });

const Category = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
