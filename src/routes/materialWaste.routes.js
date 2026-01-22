
import express from "express";
import {
  createMaterialWaste,
  getMaterialWasteReport,
  getMaterialWasteList,
} from "../controllers/materialWaste.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/* =====================================================
   GET MATERIAL WASTE LIST (PAGE LOAD)
   GET /api/material-waste
===================================================== */
router.get(
  "/",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "RESTAURANT_MANAGER",
    "ACCOUNTANT",
    "STORE_MANAGER"
  ),
  getMaterialWasteList
);

/* =====================================================
   CREATE MATERIAL WASTE
   POST /api/material-waste
===================================================== */
router.post(
  "/",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "RESTAURANT_MANAGER",
    "ACCOUNTANT",
    "STORE_MANAGER"
  ),
  createMaterialWaste
);

/* =====================================================
   WASTE REPORT
   GET /api/material-waste/report
===================================================== */
router.get(
  "/report",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "RESTAURANT_MANAGER",
    "ACCOUNTANT",
    "STORE_MANAGER"
  ),
  getMaterialWasteReport
);

export default router;
