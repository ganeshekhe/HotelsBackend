
import express from "express";
import {
  getOrders,
  createOrder,
  addItemsToOrder,
  updateOrderStatus,
  deleteOrder,
  removeOrderItem,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/* ---------------- GET ALL ORDERS ---------------- */
router.get("/", protect, getOrders);

/* ---------------- CREATE NEW ORDER ---------------- */
router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER", "CASHIER"),
  createOrder
);

/* ---------------- ADD ITEMS TO EXISTING ORDER ---------------- */
router.post(
  "/:orderId/items",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER", "CASHIER"),
  addItemsToOrder
);

/* ---------------- UPDATE ORDER STATUS ---------------- */
router.put(
  "/:id/status",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER", "KITCHEN"),
  updateOrderStatus
);

/* ---------------- REMOVE SINGLE ITEM ---------------- */
router.delete(
  "/:orderId/item/:itemId",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER", "CASHIER"),
  removeOrderItem
);

/* ---------------- DELETE ENTIRE ORDER ---------------- */
router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "RESTAURANT_MANAGER"),
  deleteOrder
);

export default router;
