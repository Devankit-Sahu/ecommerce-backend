const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  addCategory,
  getAllCategories,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();
//for normal users
router.route("/all-categories").get(getAllCategories);
//routes for admin
router
  .route("/admin/category/new")
  .post(verifyToken, authorizeRoles("admin"), addCategory);
router.route("/admin/all-categories").get(getAllCategories);
router
  .route("/admin/delete-category/?:categoryId")
  .delete(verifyToken, authorizeRoles("admin"), deleteCategory);
module.exports = router;
