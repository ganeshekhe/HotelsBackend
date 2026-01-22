

export const tenantGuard = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: user not authenticated",
      });
    }

    if (!req.user.tenantId) {
      return res.status(403).json({
        message: "Access denied: tenant missing",
      });
    }

    next();
  } catch (error) {
    console.error("Tenant guard error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
