import express from "express";
const router = express.Router();
import { authorizeRoles, verifyToken } from "../middleware/authMiddleware.js";
import { dashboardData } from "../controllers/statsController.js";

router
  .route("/dashboard")
  .get(verifyToken, authorizeRoles("admin"), dashboardData);

export default router;
