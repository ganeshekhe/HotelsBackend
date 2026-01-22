
import Material from "../models/Material.model.js";

/* =========================
   GET MATERIALS (TENANT SAFE)
========================= */
export const getMaterials = async (req, res) => {
  try {
    const filter =
      req.user.role === "SUPER_ADMIN"
        ? {}
        : { tenantId: req.user.tenantId };

    const materials = await Material.find(filter).sort({ name: 1 });

    res.status(200).json(materials);
  } catch (err) {
    console.error("GET MATERIALS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CREATE / ADD MATERIAL STOCK
   (AUTO ADD QTY IF EXISTS)
========================= */
export const createMaterial = async (req, res) => {
  try {
    let {
      name,
      unit,
      currentStock = 0,
      reorderLevel = 5,
      pricePerUnit = 0,
    } = req.body;

    if (!name || !unit) {
      return res
        .status(400)
        .json({ message: "Name and unit are required" });
    }

    name = name.trim().toLowerCase();
    unit = unit.trim().toLowerCase();

    if (currentStock < 0 || reorderLevel < 0 || pricePerUnit < 0) {
      return res
        .status(400)
        .json({ message: "Invalid numeric values" });
    }

    /* =========================
       CHECK EXISTING MATERIAL
    ========================= */
    const existing = await Material.findOne({
      tenantId: req.user.tenantId,
      name,
    });

    /* =========================
       IF EXISTS → ADD STOCK
    ========================= */
    if (existing) {
      existing.currentStock += Number(currentStock);

      // optional: update price if provided
      if (pricePerUnit > 0) {
        existing.pricePerUnit = pricePerUnit;
      }

      if (reorderLevel >= 0) {
        existing.reorderLevel = reorderLevel;
      }

      await existing.save();

      return res.status(200).json({
        message: "Material stock updated",
        material: existing,
      });
    }

    /* =========================
       ELSE → CREATE NEW
    ========================= */
    const material = await Material.create({
      tenantId: req.user.tenantId,
      name,
      unit,
      currentStock,
      reorderLevel,
      pricePerUnit,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Material created",
      material,
    });
  } catch (err) {
    console.error("CREATE MATERIAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE MATERIAL (TENANT SAFE)
========================= */
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    if (req.body.name !== undefined) {
      updateData.name = req.body.name.trim().toLowerCase();
    }

    if (req.body.unit !== undefined) {
      updateData.unit = req.body.unit.trim().toLowerCase();
    }

    if (req.body.currentStock !== undefined) {
      if (req.body.currentStock < 0) {
        return res
          .status(400)
          .json({ message: "Invalid stock value" });
      }
      updateData.currentStock = req.body.currentStock;
    }

    if (req.body.reorderLevel !== undefined) {
      if (req.body.reorderLevel < 0) {
        return res
          .status(400)
          .json({ message: "Invalid reorder level" });
      }
      updateData.reorderLevel = req.body.reorderLevel;
    }

    if (req.body.pricePerUnit !== undefined) {
      if (req.body.pricePerUnit < 0) {
        return res
          .status(400)
          .json({ message: "Invalid price value" });
      }
      updateData.pricePerUnit = req.body.pricePerUnit;
    }

    const material = await Material.findOneAndUpdate(
      {
        _id: id,
        tenantId: req.user.tenantId,
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!material) {
      return res
        .status(404)
        .json({ message: "Material not found" });
    }

    res.status(200).json(material);
  } catch (err) {
    console.error("UPDATE MATERIAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DELETE MATERIAL (TENANT SAFE)
========================= */
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!material) {
      return res
        .status(404)
        .json({ message: "Material not found" });
    }

    await material.deleteOne();

    res.status(200).json({
      message: "Material deleted successfully",
    });
  } catch (err) {
    console.error("DELETE MATERIAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
