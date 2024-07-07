import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { Product } from "../models/productModel.js";
import { Order } from "../models/orderModel.js";
import { User } from "../models/userModel.js";

//admin stats
export const dashboardData = catchAsyncErrors(async (req, res, next) => {
  const totalOrders = await Order.find();

  const [totalProducts, totalUsers] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ role: { $ne: "admin" } }),
  ]);

  const totalSales = totalOrders.reduce(
    (acc, curr) => acc + curr.totalPrice,
    0
  );

  const today = new Date();
  const lastSixMonthsAgo = new Date(today);
  lastSixMonthsAgo.setMonth(lastSixMonthsAgo.getMonth() - 6);

  const lastSixMonthsOrders = await Order.find({
    createdAt: {
      $gte: lastSixMonthsAgo,
      $lte: today,
    },
  });

  const orderMonthCounts = new Array(6).fill(0);
  const orderMonthlyRevenue = new Array(6).fill(0);

  lastSixMonthsOrders.forEach((order) => {
    const creationDate = new Date(order.createdAt);
    const monthDiff =
      (today.getFullYear() - creationDate.getFullYear()) * 12 +
      (today.getMonth() - creationDate.getMonth());

    if (monthDiff < 6) {
      orderMonthCounts[5 - monthDiff] += 1;
      orderMonthlyRevenue[5 - monthDiff] += order.totalPrice;
    }
  });

  const lastOneMonth = new Date(today);
  lastOneMonth.setMonth(lastOneMonth.getMonth() - 1);

  const lastOneMonthOrders = await Order.find({
    createdAt: {
      $gte: lastOneMonth,
      $lte: today,
    },
  }).populate("userId", "name email -_id");

  const topFiveProducts = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.productId",
        totalSales: { $sum: "$orderItems.quantity" },
        productName: { $first: "$orderItems.name" },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        productName: 1,
        totalSales: 1,
      },
    },
  ]);

  const productsInStock = await Product.countDocuments({ stock: { $gt: 0 } });
  const productsOutOfStock = await Product.countDocuments({ stock: 0 });

  res.status(200).json({
    success: true,
    totalSales,
    totalOrders: totalOrders.length,
    totalProducts,
    totalUsers,
    chart: {
      order: orderMonthCounts,
      revenue: orderMonthlyRevenue,
      productsInStock,
      productsOutOfStock,
    },
    lastOneMonthOrders,
    topFiveProducts,
  });
});
