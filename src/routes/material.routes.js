
import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../controllers/material.controller.js";

const router = express.Router();

/* =========================
   MATERIAL ROUTES
========================= */

/**
 * 🔍 GET ALL MATERIALS
 * Roles: SUPER_ADMIN, STORE_MANAGER, RESTAURANT_MANAGER
 */
router.get(
  "/",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "STORE_MANAGER",
    "RESTAURANT_MANAGER"
  ),
  getMaterials
);

/**
 * ➕ CREATE MATERIAL
 * Roles: SUPER_ADMIN, STORE_MANAGER, RESTAURANT_MANAGER
 */
router.post(
  "/",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "STORE_MANAGER",
    "RESTAURANT_MANAGER"
  ),
  createMaterial
);

/**
 * ✏️ UPDATE MATERIAL
 * Roles: SUPER_ADMIN, STORE_MANAGER, RESTAURANT_MANAGER
 */
router.put(
  "/:id",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "STORE_MANAGER",
    "RESTAURANT_MANAGER"
  ),
  updateMaterial
);

/**
 * 🗑️ DELETE MATERIAL
 * Roles: SUPER_ADMIN, STORE_MANAGER, RESTAURANT_MANAGER
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "STORE_MANAGER",
    "RESTAURANT_MANAGER"
  ),
  deleteMaterial
);

export default router;
