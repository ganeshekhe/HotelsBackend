
import express from "express";
import {
  createMenuCategory,
  getMenuCategories,
} from "../controllers/menuCategory.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Protected routes
router.get("/", protect, getMenuCategories);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER"),
  createMenuCategory
);

export default router;
