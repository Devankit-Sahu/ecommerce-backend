import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";

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

export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  if (!orderId) return next(new ErrorHandler("Order id is missing", 404));

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully!!!",
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

  let order = await Order.findById(orderId).populate(
    "userId",
    "name email -_id"
  );

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
    const { orderStatus, deliveredAt } = req.body;

    if (!orderId) return next(new ErrorHandler("Order id is missing", 404));
    if (!orderStatus)
      return next(new ErrorHandler("OrderStatus is missing", 404));
    if (!deliveredAt)
      return next(new ErrorHandler("Delivery date is missing", 404));

    let order = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (order.orderStatus === "delivered") {
      return next(new ErrorHandler("Order is already delivered", 400));
    }

    order.orderStatus = orderStatus;
    order.deliveredAt = new Date(deliveredAt);
    await order.save();

    for (let item of order.orderItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status is updated",
    });
  }
);
