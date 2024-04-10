import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, "ratings cannot be negative"],
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ProductReview = mongoose.model(
  "ProductReview",
  productReviewSchema
);
