import express from "express";
const router = express.Router();
import { authorizeRoles, verifyToken } from "../middleware/authMiddleware.js";
import {
  newOrder,
  myOrders,
  getSingleOrder,
  allOrdersByAdmin,
  orderDetailsByAdmin,
  updateOrderStatusByAdmin,
  deleteOrder,
} from "../controllers/orderController.js";

router.route("/new").post(verifyToken, newOrder);
router.route("/my").get(verifyToken, myOrders);
router
  .route("/:orderId")
  .get(verifyToken, getSingleOrder)
  .delete(verifyToken, deleteOrder);
// admin routes
router
  .route("/admin/all")
  .get(verifyToken, authorizeRoles(["admin"]), allOrdersByAdmin);
router
  .route("/admin/:orderId")
  .get(verifyToken, authorizeRoles(["admin"]), orderDetailsByAdmin)
  .put(verifyToken, authorizeRoles(["admin"]), updateOrderStatusByAdmin);

export default router;
