


import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // 🔐 Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, token missing" });
    }

    // 🔐 Ensure secret exists (safety check)
    if (!process.env.JWT_ACCESS_SECRET) {
      console.error("JWT_ACCESS_SECRET not configured");
      return res
        .status(500)
        .json({ message: "Server configuration error" });
    }

    // 🔓 Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    // 👤 Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ message: "User inactive or not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    // 🔥 TOKEN EXPIRED (expected case)
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "TOKEN_EXPIRED" });
    }

    // ❌ Other auth errors
    console.error("Auth middleware error:", err.message);
    return res
      .status(401)
      .json({ message: "Invalid token" });
  }
};
