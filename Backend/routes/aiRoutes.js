import express from "express";
import { suggestTicketResolution, summarizeTicket } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/suggest-resolution", suggestTicketResolution);
router.post("/summarize-ticket", summarizeTicket);

export default router;
