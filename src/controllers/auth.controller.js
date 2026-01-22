


import User from "../models/User.model.js";
import Tenant from "../models/Tenant.model.js";
import AuditLog from "../models/AuditLog.model.js";
import jwt from "jsonwebtoken";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required" });
    }

    email = email.trim().toLowerCase();
    console.log("LOGIN EMAIL:", email);

    const user = await User.findOne({ email, isActive: true });
    console.log("USER FOUND:", !!user);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials" });
    }

    console.log("USER ROLE:", user.role);
    console.log("USER TENANT:", user.tenantId);

    /* =========================
       TENANT VALIDATION
    ========================= */
    if (user.role !== "SUPER_ADMIN") {
      if (!user.tenantId) {
        return res
          .status(403)
          .json({ message: "Tenant not assigned" });
      }

      const tenant = await Tenant.findById(user.tenantId);
      if (!tenant || !tenant.isActive) {
        return res
          .status(403)
          .json({ message: "Tenant inactive" });
      }
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await AuditLog.create({
      user: user._id,
      tenantId: user.tenantId ?? null,
      action: "LOGIN",
      ip: req.ip,
    });

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId ?? null,
        },
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   REFRESH TOKEN
========================= */
export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Refresh token missing" });
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      console.error("JWT_REFRESH_SECRET not configured");
      return res
        .status(500)
        .json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res
        .status(403)
        .json({ message: "User inactive" });
    }

    const accessToken = generateAccessToken(user);
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    res
      .status(403)
      .json({ message: "Invalid refresh token" });
  }
};

/* =========================
   GET CURRENT USER
========================= */
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authenticated" });
    }

    let tenant = null;

    if (req.user.tenantId) {
      tenant = await Tenant.findById(req.user.tenantId)
        .select("name isActive");
    }

    res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      tenantId: req.user.tenantId ?? null,
      tenant,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   LOGOUT
========================= */
export const logout = async (req, res) => {
  try {
    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        tenantId: req.user.tenantId ?? null,
        action: "LOGOUT",
        ip: req.ip,
      });
    }

    res
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   REGISTER
========================= */
export const register = async (req, res) => {
  try {
    let { name, email, password, role, tenantId } =
      req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Missing required fields" });
    }

    email = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use" });
    }

    let assignedTenantId = null;

    if (role !== "SUPER_ADMIN") {
      if (req.user?.role === "SUPER_ADMIN") {
        assignedTenantId = tenantId;
      } else {
        assignedTenantId = req.user.tenantId;
      }
    }

    if (role !== "SUPER_ADMIN" && !assignedTenantId) {
      return res
        .status(400)
        .json({ message: "Tenant is required" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      tenantId: assignedTenantId,
    });

    await AuditLog.create({
      user: user._id,
      tenantId: assignedTenantId,
      action: "REGISTER",
      ip: req.ip,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId ?? null,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
