import express from "express";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} from "../controllers/vendorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getVendors);
router.get("/:id", getVendorById);
router.post("/", authorize("admin"), createVendor);
router.put("/:id", authorize("admin"), updateVendor);
router.delete("/:id", authorize("admin"), deleteVendor);

export default router;
