
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  markAttendance,
  getAttendanceByDate,
} from "../controllers/attendance.controller.js";

const router = express.Router();

// MARK attendance (Present / Half / Absent)
router.post(
  "/mark",
  protect,
  authorizeRoles("SUPER_ADMIN", "HOTEL_MANAGER","RESTAURANT_MANAGER",),
  markAttendance
);

// Get attendance by date
router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "HOTEL_MANAGER", "ACCOUNTANT","RESTAURANT_MANAGER",),
  getAttendanceByDate
);

export default router;
