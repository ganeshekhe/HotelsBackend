
import express from "express";
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipe.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ✅ Get all recipes
router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "STORE_MANAGER", "RESTAURANT_MANAGER"),
  getRecipes
);

// ✅ Create new recipe
router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "STORE_MANAGER", "RESTAURANT_MANAGER"),
  createRecipe
);

// ✅ Update recipe
router.put(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "STORE_MANAGER"),
  updateRecipe
);

// ✅ Delete recipe
router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "STORE_MANAGER"),
  deleteRecipe
);

export default router;
