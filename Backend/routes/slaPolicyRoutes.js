import express from "express";
import {
  createSlaPolicy,
  getSlaPolicies,
  getSlaPolicyById,
  updateSlaPolicy,
  deleteSlaPolicy,
} from "../controllers/slaPolicyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getSlaPolicies);
router.get("/:id", getSlaPolicyById);
router.post("/", authorize("admin"), createSlaPolicy);
router.put("/:id", authorize("admin"), updateSlaPolicy);
router.delete("/:id", authorize("admin"), deleteSlaPolicy);

export default router;
