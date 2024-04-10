import express from "express";
const router = express.Router();
import { authorizeRoles, verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";
import {
  addProductReview,
  createProductByAdmin,
  deleteProductByAdmin,
  getAllProducts,
  getAllProductsByAdmin,
  getSingleProduct,
  getSingleProductByAdmin,
  updateProductByAdmin,
} from "../controllers/productContoller.js";

// normal user routes
router.route("/all").get(getAllProducts);
router.route("/:productId").get(getSingleProduct);
router.route("/reviews/add").post(verifyToken, addProductReview);

// admin routes
router
  .route("/admin/new")
  .post(
    verifyToken,
    authorizeRoles(["admin", "user"]),
    upload.array("images", 8),
    createProductByAdmin
  );
router
  .route("/admin/all")
  .get(verifyToken, authorizeRoles(["admin", "user"]), getAllProductsByAdmin);
router
  .route("/admin/:productId")
  .put(
    verifyToken,
    authorizeRoles(["admin"]),
    upload.array("images", 8),
    updateProductByAdmin
  )
  .get(verifyToken, authorizeRoles(["admin", "user"]), getSingleProductByAdmin)
  .delete(verifyToken, authorizeRoles(["admin", "user"]), deleteProductByAdmin);

export default router;
