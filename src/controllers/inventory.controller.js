
import Material from "../models/Material.model.js";

// 🟢 GET all materials with low stock info
export const getMaterials = async (req, res) => {
  try {
    let filter = {};

    // 🔐 SUPER ADMIN → ALL TENANTS
    // 🔐 Others → only their tenant
    if (req.user.role !== "SUPER_ADMIN") {
      filter.tenantId = req.user.tenantId;
    }

    const materials = await Material.find(filter).sort({ name: 1 });

    const response = materials.map((m) => {
      const currentStock = Number(m.currentStock) || 0;
      const reorderLevel = Number(m.reorderLevel) || 0;

      return {
        _id: m._id,
        name: m.name,
        unit: m.unit,
        currentStock,
        reorderLevel,
        lowStock: currentStock <= reorderLevel,
        pricePerUnit: Number(m.pricePerUnit) || 0,
      };
    });

    res.json(response);
  } catch (err) {
    console.error("Inventory fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
