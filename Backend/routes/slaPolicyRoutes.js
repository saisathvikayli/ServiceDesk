import express from "express";
import {
  getSlaPolicies,
  createSlaPolicy,
  updateSlaPolicy,
  deleteSlaPolicy,
} from "../controllers/slaPolicyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// View SLA Policies (Managers & Admins)
router.get("/", authorize("manager", "admin"), getSlaPolicies);

// Create SLA Policy (Managers & Admins)
router.post("/", authorize("manager", "admin"), createSlaPolicy);

// Update SLA Policy (Managers & Admins)
router.put("/:id", authorize("manager", "admin"), updateSlaPolicy);

// Delete SLA Policy (Admin Only)
router.delete("/:id", authorize("admin"), deleteSlaPolicy);

export default router;  