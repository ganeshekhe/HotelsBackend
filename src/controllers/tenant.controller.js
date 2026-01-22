


import Tenant from "../models/Tenant.model.js";

/* =========================
   GET ALL TENANTS
========================= */
export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find()
      .sort({ createdAt: -1 });

    res.status(200).json(tenants);
  } catch (err) {
    console.error("Get tenants error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CREATE TENANT
========================= */
export const createTenant = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Tenant name is required",
      });
    }

    name = name.trim();

    // duplicate check
    const exists = await Tenant.findOne({ name });
    if (exists) {
      return res.status(409).json({
        message: "Tenant already exists",
      });
    }

    const tenant = await Tenant.create({ name });

    res.status(201).json({
      message: "Tenant created successfully",
      tenant,
    });
  } catch (err) {
    console.error("Create tenant error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET TENANT PROFILE (SELF)
========================= */
export const getTenantProfile = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    res.status(200).json(tenant);
  } catch (err) {
    console.error("Get tenant profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE TENANT PROFILE
========================= */
export const updateTenantProfile = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name !== undefined) {
      updateData.name = req.body.name;
    }
    if (req.body.address !== undefined) {
      updateData.address = req.body.address;
    }
    if (req.body.gstNumber !== undefined) {
      updateData.gstNumber = req.body.gstNumber;
    }
    if (req.body.footerNote !== undefined) {
      updateData.footerNote = req.body.footerNote;
    }

    // logo upload (GridFS / Multer)
    if (req.file) {
      updateData.logo = req.file.filename;
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.user.tenantId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    res.status(200).json({
      message: "Tenant profile updated successfully",
      tenant,
    });
  } catch (err) {
    console.error("Update tenant profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

