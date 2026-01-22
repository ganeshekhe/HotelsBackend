

import mongoose from "mongoose";
import Recipe from "../models/Recipe.model.js";
import MenuItem from "../models/MenuItem.model.js";
import Material from "../models/Material.model.js";

// ✅ Get all recipes (tenant wise)
export const getRecipes = async (req, res) => {
  try {
    let filter = {};

    // 🔐 SUPER_ADMIN → all tenants
    // 🔐 Others → own tenant only
    if (req.user.role !== "SUPER_ADMIN") {
      filter.tenantId = req.user.tenantId;
    }

    const recipes = await Recipe.find(filter)
      .populate("menuItem", "name")
      .populate("materials.material", "name unit currentStock")
      .sort({ createdAt: -1 });

    return res.status(200).json(recipes);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Create a new recipe
export const createRecipe = async (req, res) => {
  try {
    const { menuItem, materials } = req.body;

    // 🧩 Validation
    if (!menuItem || !materials || materials.length === 0) {
      return res
        .status(400)
        .json({ message: "Menu item and materials are required" });
    }

    // 🧩 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(menuItem)) {
      return res.status(400).json({ message: "Invalid menuItem ID" });
    }

    for (let m of materials) {
      if (!mongoose.Types.ObjectId.isValid(m.material)) {
        return res
          .status(400)
          .json({ message: `Invalid material ID: ${m.material}` });
      }
    }

    // 🔐 Validate menu item belongs to same tenant
    const menu = await MenuItem.findOne({
      _id: menuItem,
      tenantId: req.user.tenantId,
    });

    if (!menu) {
      return res.status(400).json({ message: "Invalid menu item" });
    }

    // 🔐 Validate materials belong to same tenant
    for (let m of materials) {
      const mat = await Material.findOne({
        _id: m.material,
        tenantId: req.user.tenantId,
      });

      if (!mat) {
        return res
          .status(400)
          .json({ message: "Invalid material in recipe" });
      }
    }

    // 🧩 Prevent duplicate recipe per tenant
    const existing = await Recipe.findOne({
      menuItem,
      tenantId: req.user.tenantId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Recipe already exists for this menu item",
      });
    }

    // 🧩 Create recipe
    const recipe = await Recipe.create({
      tenantId: req.user.tenantId, // 🔑 MULTI TENANT KEY
      menuItem,
      materials,
      createdBy: req.user._id,
    });

    return res.status(201).json(recipe);
  } catch (err) {
    console.error("Error creating recipe:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Update recipe (tenant safe)
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    const recipe = await Recipe.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // 🔐 Only allow materials update (menuItem change not allowed)
    if (req.body.materials !== undefined) {
      if (!Array.isArray(req.body.materials) || req.body.materials.length === 0) {
        return res
          .status(400)
          .json({ message: "Materials are required" });
      }

      for (let m of req.body.materials) {
        if (!mongoose.Types.ObjectId.isValid(m.material)) {
          return res
            .status(400)
            .json({ message: `Invalid material ID: ${m.material}` });
        }

        const mat = await Material.findOne({
          _id: m.material,
          tenantId: req.user.tenantId,
        });

        if (!mat) {
          return res
            .status(400)
            .json({ message: "Invalid material in recipe" });
        }
      }

      updateData.materials = req.body.materials;
    }

    Object.assign(recipe, updateData);
    await recipe.save({ validateBeforeSave: true });

    return res.status(200).json(recipe);
  } catch (err) {
    console.error("Error updating recipe:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Delete recipe (tenant safe)
export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    await recipe.deleteOne();

    return res
      .status(200)
      .json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error("Error deleting recipe:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
