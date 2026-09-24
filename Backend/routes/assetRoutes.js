import express from "express";
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
} from "../controllers/assetController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getAssets);
router.get("/:id", getAssetById);
router.post("/", authorize("admin"), createAsset);
router.put("/:id", authorize("admin"), updateAsset);
router.delete("/:id", authorize("admin"), deleteAsset);

export default router;
