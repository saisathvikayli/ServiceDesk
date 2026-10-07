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

// View routes (All authenticated roles)
router.get("/", getTickets);
router.get("/:id", getTicketById);

// Ticket creation (Employees, Technicians, Managers, Admins)
router.post(
  "/",
  authorize("employee", "technician", "manager", "admin"),
  createTicket
);

// Ticket management & assignments (Technicians, Managers, Admins)
router.put(
  "/:id",
  authorize("technician", "manager", "admin"),
  updateTicket
);
router.patch(
  "/:id/assign",
  authorize("technician", "manager", "admin"),
  assignTicket
);
router.patch(
  "/:id/status",
  authorize("technician", "manager", "admin"),
  updateStatus
);

// Comments & Work logs
router.post(
  "/:id/comments",
  authorize("employee", "technician", "manager", "admin"),
  addComment
);
router.get("/:id/comments", getComments);
router.post(
  "/:id/worklogs",
  authorize("technician", "manager", "admin"),
  addWorkLog
);

// Ticket deletion (STRICTLY Admin only)
router.delete("/:id", authorize("admin"), deleteTicket);

export default router;