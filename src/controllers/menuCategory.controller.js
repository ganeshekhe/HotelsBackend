
import MenuCategory from "../models/MenuCategory.model.js";

// 🟢 Get all categories
export const getMenuCategories = async (req, res) => {
  try {
    let filter = {};

    // 🔐 SUPER_ADMIN → all tenants
    // 🔐 Others → only own tenant
    if (req.user.role !== "SUPER_ADMIN") {
      filter.tenantId = req.user.tenantId;
    }

    const categories = await MenuCategory.find(filter).sort({
      createdAt: -1,
    });

    res.json(categories);
  } catch (err) {
    console.error("GET MENU CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 🟢 CREATE MENU CATEGORY
export const createMenuCategory = async (req, res) => {
  try {
    let { name } = req.body;

    // 🔴 Validation
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ message: "Category name is required" });
    }

    name = name.trim().toLowerCase();

    // 🔐 Check duplicate (same tenant only)
    const existing = await MenuCategory.findOne({
      tenantId: req.user.tenantId,
      name,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Category already exists" });
    }

    // 🟢 Create category
    const category = await MenuCategory.create({
      tenantId: req.user.tenantId, // 🔑 MULTI-TENANT KEY
      name,
      createdBy: req.user._id,
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("CREATE MENU CATEGORY ERROR:", err);

    // 🔐 Mongo duplicate safety (extra protection)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Category already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
};
