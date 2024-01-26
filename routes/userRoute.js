const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserDetails,
  updateUserDetails,
  deleteUserByAdmin,
  deleteUser,
  getUserDetailsByAdmin,
  getAllUsersByAdmin,
  refreshAccessToken,
} = require("../controllers/userController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
// Admin route
router
  .route("/admin/users")
  .get(verifyToken, authorizeRoles("admin"), getAllUsersByAdmin);
// Admin route
router
  .route("/admin/user/:id")
  .get(verifyToken, authorizeRoles("admin"), getUserDetailsByAdmin);
// Normal user
router.route("/me").get(verifyToken, getUserDetails);
router.route("/me/update").put(verifyToken, updateUserDetails);
// refreshaccesstoken route
router.route("/refresh").post(refreshAccessToken);

module.exports = router;
