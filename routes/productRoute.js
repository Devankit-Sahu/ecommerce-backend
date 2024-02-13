const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  getAllProductsByAdmin,
  addProductReview,
  addProductDiscount,
  getAllDiscount,
  getProductsReview,
} = require("../controllers/productContoller");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();
// normal user routes
router.route("/products").get(getAllProducts);
router.route("/product/:productId").get(getSingleProduct);
// admin routes
router
  .route("/admin/products")
  .get(verifyToken, authorizeRoles("admin"), getAllProductsByAdmin);
router
  .route("/admin/product/new")
  .post(
    verifyToken,
    authorizeRoles("admin"),
    upload.array("images", 8),
    createProduct
  );
router
  .route("/admin/product/:productId")
  .put(
    verifyToken,
    authorizeRoles("admin"),
    upload.array("images", 8),
    updateProduct
  )
  .delete(verifyToken, authorizeRoles("admin"), deleteProduct)
  .get(verifyToken, authorizeRoles("admin"), getSingleProduct);

router
  .route("/admin/product/reviews/add")
  .post(verifyToken, authorizeRoles("admin"), addProductReview);
router
  .route("/admin/product/reviews/all")
  .post(verifyToken, authorizeRoles("admin"), getProductsReview);

module.exports = router;
