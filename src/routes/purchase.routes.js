
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  getPurchases,
  createPurchase,
} from "../controllers/purchase.controller.js";

const router = express.Router();

// 🔒 Only SUPER_ADMIN & STORE_MANAGER can manage purchase
router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "STORE_MANAGER"),
  getPurchases
);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "STORE_MANAGER"),
  createPurchase
);

export default router;
