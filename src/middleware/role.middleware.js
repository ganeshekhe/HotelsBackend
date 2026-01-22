
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Role ${req.user.role} not allowed`,
        });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
