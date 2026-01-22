

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  getSalesSummary,
  getProfitLoss,
  exportReportExcel,
  exportReportPDF,
} from "../controllers/report.controller.js";

const router = express.Router();

/* =========================
   SALES SUMMARY
========================= */
router.get(
  "/sales",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "RESTAURANT_MANAGER",
    "HOTEL_MANAGER",
    "ACCOUNTANT"
  ),
  getSalesSummary
);

/* =========================
   PROFIT & LOSS (DASHBOARD)
========================= */
router.get(
  "/profit-loss",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "RESTAURANT_MANAGER",
    "HOTEL_MANAGER",
    "ACCOUNTANT"
  ),
  getProfitLoss
);

/* =========================
   EXPORT REPORTS
========================= */
router.get(
  "/export/excel",
  protect,
  authorizeRoles("SUPER_ADMIN", "ACCOUNTANT"),
  exportReportExcel
);

router.get(
  "/export/pdf",
  protect,
  authorizeRoles("SUPER_ADMIN", "ACCOUNTANT"),
  exportReportPDF
);

export default router;
