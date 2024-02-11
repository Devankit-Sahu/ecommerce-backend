const mongoose = require("mongoose");

const productDiscountSchema = new mongoose.Schema(
  {
    discountPercent: {
      type: Number,
      min: [0, "Discount value cannot be negative"],
      max: [100, "Discount value cannot exceed 100%"],
      default: 0,
    },
    active: { type: Boolean, default: false },
    start: Date,
    end: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductDiscount", productDiscountSchema);
