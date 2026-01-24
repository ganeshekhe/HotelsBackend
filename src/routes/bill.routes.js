

// import express from "express";
// import {
//   createBill,
//   getBills,
// } from "../controllers/bill.controller.js";
// import { protect } from "../middleware/auth.middleware.js";
// import { authorizeRoles } from "../middleware/role.middleware.js";

// const router = express.Router();

// router.post(
//   "/",
//   protect,
//   authorizeRoles(
//     "SUPER_ADMIN",
//     "ACCOUNTANT",
//     "RESTAURANT_MANAGER",
//     "CASHIER"
//   ),
//   createBill
// );

// router.get(
//   "/",
//   protect,
//   authorizeRoles(
//     "SUPER_ADMIN",
//     "ACCOUNTANT",
//     "RESTAURANT_MANAGER"
//   ),
//   getBills
// );

// export default router;
import express from "express";
import {
  createBill,
  getBills,
} from "../controllers/bill.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/* =====================================================
   🟢 CREATE BILL
===================================================== */
router.post(
  "/",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "ACCOUNTANT",
    "RESTAURANT_MANAGER",
    "CASHIER"
  ),
  createBill
);

/* =====================================================
   🟡 GET ALL BILLS (TENANT WISE)
===================================================== */
router.get(
  "/",
  protect,
  authorizeRoles(
    "SUPER_ADMIN",
    "ACCOUNTANT",
    "RESTAURANT_MANAGER"
  ),
  getBills
);

export default router;
