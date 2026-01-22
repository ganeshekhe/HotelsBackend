import User from "../models/User.model.js";
import bcrypt from "bcryptjs";


export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, tenantId } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let finalTenantId = null;

    if (role !== "SUPER_ADMIN") {
      if (req.user.role === "SUPER_ADMIN") {
        finalTenantId = tenantId;
      } else {
        finalTenantId = req.user.tenantId;
      }
    }

    // 🔥 IMPORTANT: password PLAIN ठेव
    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password,              // ✅ plain password
      role,
      tenantId: finalTenantId
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId ?? null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET USERS OF TENANT
 */
export const getTenantUsers = async (req, res) => {
  try {
    const users = await User.find({
      tenantId: req.params.tenantId
    }).select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
