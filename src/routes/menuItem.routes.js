
import express from "express";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuItem.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, getMenuItems);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER"),
  createMenuItem
);

router.put(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER"),
  updateMenuItem
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER"),
  deleteMenuItem
);

export default router;
