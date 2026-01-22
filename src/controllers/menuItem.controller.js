
import MenuItem from "../models/MenuItem.model.js";
import MenuCategory from "../models/MenuCategory.model.js";

// 🟢 Get all items
export const getMenuItems = async (req, res) => {
  try {
    let filter = {};

    // 🔐 SUPER_ADMIN → all tenants
    // 🔐 Others → only own tenant
    if (req.user.role !== "SUPER_ADMIN") {
      filter.tenantId = req.user.tenantId;
    }

    const items = await MenuItem.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("GET MENU ITEMS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Create new item
export const createMenuItem = async (req, res) => {
  try {
    let { name, price, category } = req.body;

    // 🔴 Validation
    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "Name, price and category are required" });
    }

    name = name.trim().toLowerCase();

    if (Number(price) <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be greater than 0" });
    }

    // 🔐 Validate category belongs to same tenant
    const cat = await MenuCategory.findOne({
      _id: category,
      tenantId: req.user.tenantId,
    });

    if (!cat) {
      return res
        .status(400)
        .json({ message: "Invalid category" });
    }

    // 🔐 Duplicate check (tenant + category + name)
    const exists = await MenuItem.findOne({
      tenantId: req.user.tenantId,
      category,
      name,
    });

    if (exists) {
      return res.status(400).json({
        message: "Menu item already exists in this category",
      });
    }

    // 🟢 Create menu item
    const item = await MenuItem.create({
      tenantId: req.user.tenantId, // 🔑 MULTI-TENANT KEY
      name,
      price,
      category,
      createdBy: req.user._id,
    });

    await item.populate("category", "name");

    res.status(201).json(item);
  } catch (err) {
    console.error("CREATE MENU ITEM ERROR:", err);

    // 🔐 MongoDB unique index safety
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Menu item already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// 🟡 Update item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    if (req.body.name !== undefined) {
      updateData.name = req.body.name.trim().toLowerCase();
    }

    if (req.body.price !== undefined) {
      if (Number(req.body.price) <= 0) {
        return res
          .status(400)
          .json({ message: "Price must be greater than 0" });
      }
      updateData.price = req.body.price;
    }

    if (req.body.category !== undefined) {
      const cat = await MenuCategory.findOne({
        _id: req.body.category,
        tenantId: req.user.tenantId,
      });
      if (!cat) {
        return res
          .status(400)
          .json({ message: "Invalid category" });
      }
      updateData.category = req.body.category;
    }

    if (req.body.isAvailable !== undefined) {
      updateData.isAvailable = req.body.isAvailable;
    }

    const updated = await MenuItem.findOneAndUpdate(
      {
        _id: id,
        tenantId: req.user.tenantId,
      },
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "name");

    if (!updated) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE MENU ITEM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔴 Delete item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findOneAndDelete({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("DELETE MENU ITEM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
