import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxLength: [70, "product name cannot exceed 70 characters"],
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      min: [0, "Stock value cannot be negative"],
      max: [9999, "Stock value cannot exceed 9999"],
    },
    seller: {
      type: String,
      required: [true, "Please enter product seller"],
    },
    productType: {
      type: String,
      enum: ["top deals", "featured products"],
      default: "top deals",
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
