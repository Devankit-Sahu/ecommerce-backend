import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { stripe } from "../server.js";
import ErrorHandler from "../utils/errorhandler.js";

export const sendStripeKey = catchAsyncErrors(async (req, res, next) => {
  res.status(201).json({
    success: true,
    publishable_key: process.env.PUBLISHABLE_KEY,
  });
});

// creating payment
export const createPayment = catchAsyncErrors(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) return next(new ErrorHandler("provide amount", 400));

  const payment = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
    description: "testing purpose",
  });

  res.status(201).json({
    success: true,
    message: "Payment created",
    clientSecret: payment.client_secret,
  });
});
