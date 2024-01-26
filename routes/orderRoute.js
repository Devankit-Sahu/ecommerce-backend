const express = require("express");
const{ newOrder, getSingleOrder, getAllOrders, updateOrder, myOrders } = require("../controllers/orderController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/order/new").post(verifyToken, authorizeRoles("admin"), newOrder);
router
  .route("/all-orders")
  .get(verifyToken, authorizeRoles("admin"), getAllOrders);
router
  .route("/order/:id")
  .get(verifyToken, authorizeRoles("admin"), getSingleOrder);
router
  .route("/update/:id")
  .put(verifyToken, authorizeRoles("admin"), updateOrder);
router.route("/my-orders").get(verifyToken, myOrders);

module.exports = router;
