import mongoose, { Document, Schema } from "mongoose";

export enum ProductCategory {
  CLOTHING = "Clothing",
  SHOES = "Shoes",
  ACCESSORIES = "Accessories",
  ELECTRONICS = "Electronics",
  HOME_DECOR = "Home & Decor",
  SPORTS = "Sports",
  BOOKS = "Books",
  BEAUTY = "Beauty",
  TOYS = "Toys",
}

export interface IProduct extends Document {
  title: string;
  description: string;
  image: string;
  category: ProductCategory;
  price: number;
  availability: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: Object.values(ProductCategory),
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    availability: {
      type: Boolean,
      required: true,
      default: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
