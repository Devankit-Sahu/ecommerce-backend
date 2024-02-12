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
  updatePassword,
} = require("../controllers/userController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
// Normal user
router.route("/me").get(verifyToken, getUserDetails);
router.route("/me/update").put(verifyToken, updateUserDetails);
router.route("/me/change-password").put(verifyToken, updatePassword);
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
