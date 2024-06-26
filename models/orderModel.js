import mongoose from "mongoose";

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
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    shippingInfo: {
      address1: { type: String, default: null },
      address2: { type: String, default: null },
      city: {
        type: String,
        required: [true, "Please enter your city"],
      },
      state: {
        type: String,
        required: [true, "Please enter your state"],
      },
      country: {
        type: String,
        required: [true, "Please enter your country"],
      },
      pincode: {
        type: String,
        required: [true, "Please enter your country"],
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    shippingCharges: {
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "TotalPrice value cannot be negative"],
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered"],
      default: "processing",
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (!this.deliveredAt) {
    this.deliveredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

export const Order = mongoose.model("Order", orderSchema);
