import express from "express";
const router = express.Router();
import { authorizeRoles, verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";
import {
  getAllUsersByAdmin,
  getUserDetails,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updatePassword,
  updateUserDetails,
} from "../controllers/userController.js";

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
// Normal user
router.route("/me").get(verifyToken, getUserDetails);
router.route("/update").put(verifyToken, updateUserDetails);
router.route("/change-password").put(verifyToken, updatePassword);
// refreshaccesstoken route
router.route("/refresh").post(verifyToken, refreshAccessToken);
// Admin route
router
  .route("/admin/all")
  .get(verifyToken, authorizeRoles("admin"), getAllUsersByAdmin);

export default router;
