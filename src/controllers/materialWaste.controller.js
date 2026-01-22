
import MaterialWaste from "../models/MaterialWaste.model.js";
import Material from "../models/Material.model.js";

/* =====================================================
   CREATE WASTE ENTRY (ERP LEVEL)
===================================================== */
export const createMaterialWaste = async (req, res) => {
  try {
    const { materialId, quantity, reason, note } = req.body;

    if (!materialId || !quantity || !reason) {
      return res
        .status(400)
        .json({ message: "Material, quantity & reason required" });
    }

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid waste quantity" });
    }

    const material = await Material.findOne({
      _id: materialId,
      tenantId: req.user.tenantId,
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (material.currentStock < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for waste entry" });
    }

    // 🔥 ERP COST CALCULATION
    const totalCost = Number(
      (quantity * material.pricePerUnit).toFixed(2)
    );

    // 1️⃣ Create waste log
    const waste = await MaterialWaste.create({
      tenantId: req.user.tenantId,
      material: materialId,
      quantity,
      reason,
      note,
      totalCost,
      createdBy: req.user._id,
    });

    // 2️⃣ Deduct stock
    material.currentStock -= quantity;
    await material.save();

    res.status(201).json(waste);
  } catch (err) {
    console.error("CREATE WASTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET WASTE REPORT (DATE / MATERIAL)
===================================================== */
export const getMaterialWasteReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {
      tenantId: req.user.tenantId,
    };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const waste = await MaterialWaste.find(filter)
      .populate("material", "name unit pricePerUnit")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(waste);
  } catch (err) {
    console.error("WASTE REPORT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET MATERIAL WASTE LIST
===================================================== */
export const getMaterialWasteList = async (req, res) => {
  try {
    const filter =
      req.user.role === "SUPER_ADMIN"
        ? {}
        : { tenantId: req.user.tenantId };

    const data = await MaterialWaste.find(filter)
      .populate("material", "name unit")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error("GET MATERIAL WASTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
