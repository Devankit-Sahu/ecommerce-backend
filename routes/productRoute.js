const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  getAllProductsByAdmin,
} = require("../controllers/productContoller");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/products").get(getAllProducts);
router
  .route("/admin/products")
  .get(verifyToken, authorizeRoles("admin"), getAllProductsByAdmin);
router
  .route("/admin/product/new")
  .post(verifyToken, authorizeRoles("admin"), createProduct);
router
  .route("/admin/product/:id")
  .put(verifyToken, authorizeRoles("admin"), updateProduct)
  .delete(verifyToken, authorizeRoles("admin"), deleteProduct)
  .get(verifyToken, authorizeRoles("admin"), getSingleProduct);

router.route("/product/:id").get(getSingleProduct);

module.exports = router;
