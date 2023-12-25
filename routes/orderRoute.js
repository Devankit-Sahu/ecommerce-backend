const express = require("express");
const{ newOrder, getSingleOrder, getAllOrders, updateOrder, myOrders } = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, authorizeRoles("admin"),newOrder);

router.route("/all-orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router.route("/order/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder);

router.route("/update/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder);

router.route("/my-orders").get(isAuthenticatedUser, myOrders);

module.exports = router;
