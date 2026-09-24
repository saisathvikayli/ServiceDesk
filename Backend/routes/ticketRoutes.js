import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  addComment,
} from "../controllers/ticketController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.post("/", authorize("agent", "admin"), createTicket);
router.put("/:id", authorize("agent", "admin"), updateTicket);
router.delete("/:id", authorize("admin"), deleteTicket);
router.post("/:id/comments", authorize("agent", "admin", "user"), addComment);

export default router;
