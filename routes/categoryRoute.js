const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  addCategory,
  getAllCategories,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router
  .route("/admin/category/new")
  .post(verifyToken, authorizeRoles("admin"), addCategory);
router.route("/admin/all-categories").get(getAllCategories);
router
  .route("/admin/delete-category/:id")
  .delete(verifyToken, authorizeRoles("admin"), deleteCategory);
router
  .route("/all-categories")
  .get(getAllCategories);

module.exports = router;
