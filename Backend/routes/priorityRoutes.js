import express from "express";
import {
  createPriority,
  getPriorities,
  getPriorityById,
  updatePriority,
  deletePriority,
} from "../controllers/priorityController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getPriorities);
router.get("/:id", getPriorityById);
router.post("/", authorize("admin"), createPriority);
router.put("/:id", authorize("admin"), updatePriority);
router.delete("/:id", authorize("admin"), deletePriority);

export default router;
