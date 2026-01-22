


import Table from "../models/Table.model.js";

/* =========================
   GET ALL TABLES
   (TENANT SAFE)
========================= */
export const getTables = async (req, res) => {
  try {
    const filter =
      req.user.role === "SUPER_ADMIN"
        ? {}
        : { tenantId: req.user.tenantId };

    const tables = await Table.find(filter)
      .sort({ createdAt: -1 });

    res.json(tables);
  } catch (err) {
    console.error("GET TABLES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CREATE TABLE
   (TENANT SAFE)
========================= */
export const createTable = async (req, res) => {
  try {
    let { name, capacity } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ message: "Table name required" });
    }

    name = name.trim().toUpperCase();
    capacity = capacity ? Number(capacity) : 4;

    if (capacity <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid capacity" });
    }

    // 🔐 Duplicate check (tenant wise)
    const exists = await Table.findOne({
      tenantId: req.user.tenantId,
      name,
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Table already exists" });
    }

    const table = await Table.create({
      tenantId: req.user.tenantId, // 🔑 MULTI-TENANT KEY
      name,
      capacity,
      createdBy: req.user._id,
    });

    res.status(201).json(table);
  } catch (err) {
    console.error("CREATE TABLE ERROR:", err);

    // 🔐 Mongo unique index safety
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Table already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE TABLE
   (TENANT SAFE)
========================= */
export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.name) {
      updateData.name = updateData.name
        .trim()
        .toUpperCase();
    }

    const filter =
      req.user.role === "SUPER_ADMIN"
        ? { _id: id }
        : { _id: id, tenantId: req.user.tenantId };

    const updated = await Table.findOneAndUpdate(
      filter,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Table not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE TABLE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DELETE TABLE
   (TENANT SAFE)
========================= */
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const filter =
      req.user.role === "SUPER_ADMIN"
        ? { _id: id }
        : { _id: id, tenantId: req.user.tenantId };

    const table = await Table.findOneAndDelete(filter);

    if (!table) {
      return res
        .status(404)
        .json({ message: "Table not found" });
    }

    res.json({ message: "Table deleted" });
  } catch (err) {
    console.error("DELETE TABLE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
