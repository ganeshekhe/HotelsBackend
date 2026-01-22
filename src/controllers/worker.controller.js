
import Worker from "../models/Worker.model.js";

/* =========================
   ROLE CHECK HELPER
========================= */
const canManageWorkers = (role) => {
  return [
    "SUPER_ADMIN",
    "HOTEL_MANAGER",
    "RESTAURANT_MANAGER",
  ].includes(role);
};

/* =========================
   CREATE WORKER (TENANT SAFE)
========================= */

export const createWorker = async (req, res) => {
  try {
    const {
      name,
      role,
      salaryType,
      salaryAmount,
      joiningDate,
      salaryRecipe,
    } = req.body;

    // 🔐 Basic validation
    if (!name || !role || !salaryType || salaryAmount == null || !joiningDate) {
      return res.status(400).json({
        message:
          "name, role, salaryType, salaryAmount and joiningDate are required",
      });
    }

    const worker = await Worker.create({
      tenantId: req.user.tenantId, // 🔑 MULTI-TENANT
      name,
      role,
      salaryType,
      salaryAmount,
      salaryRecipe: salaryRecipe || null,
      joiningDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Worker created successfully",
      worker,
    });
  } catch (err) {
    console.error("CREATE WORKER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET WORKERS (TENANT WISE)
========================= */
export const getWorkers = async (req, res) => {
  try {
    const filter =
      req.user.role === "SUPER_ADMIN"
        ? {}
        : { tenantId: req.user.tenantId };

    const workers = await Worker.find(filter).sort({
      createdAt: -1,
    });

    res.json(workers);
  } catch (err) {
    console.error("GET WORKERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE WORKER (TENANT SAFE)
========================= */
export const updateWorker = async (req, res) => {
  try {
    if (!canManageWorkers(req.user.role)) {
      return res.status(403).json({
        message: "You are not allowed to update workers",
      });
    }

    const { id } = req.params;

    const filter =
      req.user.role === "SUPER_ADMIN"
        ? { _id: id }
        : { _id: id, tenantId: req.user.tenantId };

    const worker = await Worker.findOneAndUpdate(
      filter,
      req.body,
      { new: true }
    );

    if (!worker) {
      return res
        .status(404)
        .json({ message: "Worker not found" });
    }

    res.json({
      message: "Worker updated successfully",
      worker,
    });
  } catch (err) {
    console.error("UPDATE WORKER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
