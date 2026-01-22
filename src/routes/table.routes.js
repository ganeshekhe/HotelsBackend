

import express from "express";
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from "../controllers/table.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Get all
router.get("/", protect, getTables);

// Create
router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER"),
  createTable
);

// Update
router.put(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER"),
  updateTable
);

// Delete
router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER"),
  deleteTable
);

export default router;
