import express from "express";
import { autocomplete } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/autocomplete", autocomplete);

export default router;