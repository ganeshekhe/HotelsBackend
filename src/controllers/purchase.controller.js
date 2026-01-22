
import Purchase from "../models/Purchase.model.js";
import Material from "../models/Material.model.js";

// 🟢 GET all purchases
export const getPurchases = async (req, res) => {
  try {
    let filter = {};

    // 🔐 SUPER_ADMIN → all tenants
    // 🔐 Others → only own tenant
    if (req.user.role !== "SUPER_ADMIN") {
      filter.tenantId = req.user.tenantId;
    }

    const purchases = await Purchase.find(filter)
      .populate("items.material", "name unit")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    console.error("GET PURCHASES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 CREATE new purchase & update stock
export const createPurchase = async (req, res) => {
  try {
    const { supplier, items } = req.body;

    if (!supplier || !items || !items.length) {
      return res
        .status(400)
        .json({ message: "Supplier and items required" });
    }

    // 🔐 Validate materials & quantities (tenant-safe)
    for (const i of items) {
      if (!i.material || i.quantity === undefined || i.quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid purchase item data" });
      }

      const material = await Material.findOne({
        _id: i.material,
        tenantId: req.user.tenantId,
      });

      if (!material) {
        return res
          .status(400)
          .json({ message: "Invalid material in purchase items" });
      }
    }

    // ✅ Create purchase record (tenant-safe)
    const purchase = await Purchase.create({
      tenantId: req.user.tenantId, // 🔑 MULTI-TENANT KEY
      supplier,
      items,
      createdBy: req.user._id,
    });

    // 🔄 Update material stock (tenant-safe)
    for (const i of items) {
      await Material.findOneAndUpdate(
        {
          _id: i.material,
          tenantId: req.user.tenantId,
        },
        { $inc: { currentStock: i.quantity } }
      );
    }

    const populated = await purchase.populate(
      "items.material",
      "name unit"
    );

    res.status(201).json(populated);
  } catch (err) {
    console.error("CREATE PURCHASE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
