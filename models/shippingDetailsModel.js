const mongoose = require("mongoose");

const shippingDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  address1: String,
  address2: String,
  landmark: String,
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
    type: Number,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: [true, "Please enter your phone number"],
  },
});

module.exports = mongoose.model("ShippingDetail", shippingDetailsSchema);
