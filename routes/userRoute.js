const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserDetails,
  updateUserDetails,
  refreshAccessToken,
  getAllUsersByAdmin,
  getUserDetailsByAdmin,
} = require("../controllers/userController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
// Normal user
router.route("/me").get(verifyToken, getUserDetails);
router.route("/me/update").put(verifyToken, updateUserDetails);
// refreshaccesstoken route
router.route("/refresh").post(refreshAccessToken);
// Admin route
router
  .route("/admin/users")
  .get(verifyToken, authorizeRoles("admin"), getAllUsersByAdmin);
// Admin route
router
  .route("/admin/user/:id")
  .get(verifyToken, authorizeRoles("admin"), getUserDetailsByAdmin);

module.exports = router;
