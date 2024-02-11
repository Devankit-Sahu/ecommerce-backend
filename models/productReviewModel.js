const mongoose = require("mongoose");

const productReviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    ratings: {
      type: Number,
      required: true,
      min: [0, "ratings cannot be negative"],
    },
    reviewMessage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductReview", productReviewSchema);
