const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0, "Quantity value cannot be negative"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price value cannot be negative"],
        },
        image: {
          type: String,
          required: true,
        },
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "UserPayment" },
    shippingCharges: {
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "TotalPrice value cannot be negative"],
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Delivered"],
      default: "Pending",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
