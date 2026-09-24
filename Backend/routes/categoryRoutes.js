import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", authorize("admin"), createCategory);
router.put("/:id", authorize("admin"), updateCategory);
router.delete("/:id", authorize("admin"), deleteCategory);

export default router;
