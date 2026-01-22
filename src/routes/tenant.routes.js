
import express from "express";
import {
  createTenant,
  getTenants,
  getTenantProfile,
  updateTenantProfile,
} from "../controllers/tenant.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import upload from "../middleware/gridfsUpload.middleware.js";

const router = express.Router();

/*
=========================
 TENANT ROUTES
 SUPER ADMIN ONLY
=========================
*/

// Get all tenants
router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN"),
  getTenants
);

// Create new tenant
router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN"),
  createTenant
);

/*
=========================
 TENANT PROFILE ROUTES
 MANAGER / SUPER ADMIN
=========================
*/

// Get own tenant profile
router.get(
  "/profile",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "RESTAURANT_MANAGER",
    "HOTEL_MANAGER"
  ),
  getTenantProfile
);

// Update own tenant profile
router.put(
  "/profile",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "RESTAURANT_MANAGER",
    "HOTEL_MANAGER"
  ),
  upload.single("logo"),
  updateTenantProfile
);

export default router;
