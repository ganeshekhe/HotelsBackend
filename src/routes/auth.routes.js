

import express from "express";
import {
  login,
  refresh,
  getMe,
  logout,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * =========================
 * AUTH ROUTES
 * =========================
 */

/**
 * 🔐 LOGIN
 * Public
 * Body: { email, password }
 */
router.post("/login", login);

/**
 * 🔁 REFRESH ACCESS TOKEN
 * Uses httpOnly cookie (refreshToken)
 * Public (cookie based)
 */
router.post("/refresh", refresh);

/**
 * 👤 GET CURRENT USER
 * Protected
 * Requires valid access token
 */
router.get("/me", protect, getMe);

/**
 * 🚪 LOGOUT
 * Protected
 * Clears refresh cookie + audit log
 */
router.post("/logout", protect, logout);

export default router;
