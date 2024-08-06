import express from "express";
const router = express.Router();
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createPayment,
  sendStripeKey,
} from "../controllers/paymentController.js";

router.route("/key").get(verifyToken, sendStripeKey);
router.route("/new").post(verifyToken, createPayment);

export default router;
