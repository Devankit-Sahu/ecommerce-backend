import express from "express";
const router = express.Router();
import { authorizeRoles, verifyToken } from "../middleware/authMiddleware.js";
import {
  getAllCategoriesByAdmin,
  addCategoryByAdmin,
  deleteCategoryByAdmin,
  getAllCategories,
} from "../controllers/categoryController.js";

router.route("/all").get(getAllCategories);
//admin routes
router
  .route("/admin/new")
  .post(verifyToken, authorizeRoles(["admin"]), addCategoryByAdmin);
router
  .route("/admin/all")
  .get(verifyToken, authorizeRoles(["admin"]), getAllCategoriesByAdmin);
router
  .route("/admin/:categoryId")
  .delete(verifyToken, authorizeRoles(["admin"]), deleteCategoryByAdmin);

export default router;
