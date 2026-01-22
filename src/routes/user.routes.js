import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createUser,
  getTenantUsers
} from "../controllers/user.controller.js";

const router = express.Router();

/**
 * SUPER_ADMIN / HOTEL_MANAGER → create users
 */
router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "HOTEL_MANAGER"),
  createUser
);

/**
 * View users of tenant
 */
router.get(
  "/tenant/:tenantId",
  protect,
  authorizeRoles("SUPER_ADMIN", "HOTEL_MANAGER"),
  getTenantUsers
);

export default router;
