const mongoose = require("mongoose");

const userPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "google_pay", "apple_pay"],
      required: true,
    },
    cardNumber: {
      type: String,
      required: true,
      minlength: [16, "Card number must be 16 digits"],
      maxlength: [16, "Card number must be 16 digits"],
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    cvv: {
      type: String,
      required: true,
      minlength: [3, "CVV must be 3 digits"],
      maxlength: [4, "CVV must be 3 or 4 digits"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPayment", userPaymentSchema);
