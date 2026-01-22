


import express from "express";
import { createWorker, getWorkers, updateWorker } from "../controllers/worker.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("SUPER_ADMIN","RESTAURANT_MANAGER"), createWorker);
router.get("/", protect, getWorkers);
router.put("/:id", protect, authorizeRoles("SUPER_ADMIN","RESTAURANT_MANAGER"), updateWorker);

export default router;
