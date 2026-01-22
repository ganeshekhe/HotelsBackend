
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getMaterials } from "../controllers/inventory.controller.js";

const router = express.Router();

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

export default router;
