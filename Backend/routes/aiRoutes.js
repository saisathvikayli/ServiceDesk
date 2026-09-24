import express from "express";
import {
  classifyTicket,
  suggestKBArticles,
  summarizeTicket,
  suggestTicketResolution,
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/classify", protect, classifyTicket);
router.post("/suggest-kb", protect, suggestKBArticles);
router.post("/summarize", protect, summarizeTicket);
router.post("/suggest-resolution", protect, suggestTicketResolution);

export default router;