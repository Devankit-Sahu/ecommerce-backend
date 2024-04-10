import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import { Order } from "../models/orderModel.js";

export const newOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderItems, shippingInfo, shippingCharges, totalPrice } = req.body;

  if (!orderItems.length)
    return next(new ErrorHandler("add atleast one item in cart to buy", 401));

  if (!shippingInfo)
    return next(new ErrorHandler("provide shipping info", 401));

  if (!totalPrice) return next(new ErrorHandler("provide totalPrice", 401));

  const order = await Order.create({
    orderItems,
    userId: req.user,
    shippingInfo,
    shippingCharges,
    totalPrice,
  });

  res.status(201).json({
    success: true,
    message: "order created",
    order,
  });
});

export const myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ userId: req.user });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  if (!orderId) return next(new ErrorHandler("Order id is missing", 404));

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// admin routes
export const allOrdersByAdmin = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

export const orderDetailsByAdmin = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  if (!orderId) return next(new ErrorHandler("Order id is missing", 404));

  let order = await Order.findById(orderId);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

export const updateOrderStatusByAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId) return next(new ErrorHandler("Order id is missing", 404));

    let order = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      updatedOrder,
    });
  }
);
