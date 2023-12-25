const express = require("express");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const { addCategory, getAllCategories, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router
  .route("/admin/category/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), addCategory);

router.route("/admin/all-categories").get(getAllCategories);
router
  .route("/admin/delete-category/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCategory);

router
  .route("/all-categories")
  .get(getAllCategories);

module.exports = router;
