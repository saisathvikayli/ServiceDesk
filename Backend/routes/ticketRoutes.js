import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  assignTicket,
  updateStatus,
  addComment,
  getComments,
  addWorkLog,
} from "../controllers/ticketController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getTickets);
router.get("/:id", getTicketById);

router.post("/", authorize("employee", "technician", "admin"), createTicket);
router.put("/:id", authorize("technician", "admin"), updateTicket);
router.delete("/:id", authorize("admin"), deleteTicket);

router.patch("/:id/assign", authorize("technician", "manager", "admin"), assignTicket);
router.patch("/:id/status", authorize("technician", "admin"), updateStatus);

router.post("/:id/comments", authorize("employee", "technician", "manager", "admin"), addComment);
router.get("/:id/comments", getComments);

router.post("/:id/worklogs", authorize("technician", "admin"), addWorkLog);

export default router;