import express from "express";
import {
  generatePayroll,
  getPayrolls,
} from "../controllers/payroll.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * 🔹 GENERATE PAYROLL (ERP LEVEL)
 * POST /api/payroll/generate
 */
router.post(
  "/generate",
  protect,
  authorizeRoles("SUPER_ADMIN", "ACCOUNTANT", "RESTAURANT_MANAGER",),
  generatePayroll
);

/**
 * 🔹 GET PAYROLL LIST
 * GET /api/payroll
 */
router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ACCOUNTANT", "RESTAURANT_MANAGER",),
  getPayrolls
);

export default router;
