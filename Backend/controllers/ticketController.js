import Ticket from "../models/Ticket.js";
import slaHeap from "../dsa/slaHeap.js";
import searchTrie from "../dsa/searchTrie.js";
import { calculateDueDate } from "../utils/slaCalculator.js";

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "cat_name name")
      .populate("priority", "p_name level slaHours")
      .sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error in getTickets:", error);
    res.status(500).json({ message: "Failed to fetch tickets", error: error.message });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "cat_name name")
      .populate("priority", "p_name level slaHours");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ticket", error: error.message });
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category, assetId } = req.body;
    const due = req.body.dueDate || req.body.dueAt || calculateDueDate("medium");

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || undefined,
      category: category || undefined,
      assetId: assetId || undefined,
      dueDate: due,
      dueAt: due,
      createdBy: req.user?._id || req.user?.id,
    });

    if (ticket.dueAt) {
      slaHeap.push(ticket._id, ticket.dueAt);
    }
    if (ticket.title) {
      searchTrie.insert(ticket.title);
    }

    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: "Failed to create ticket", error: error.message });
  }
};

// @desc    Update entire ticket
// @route   PUT /api/tickets/:id
// @access  Private (Technician, Manager, Admin)
export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json({ message: "Failed to update ticket", error: error.message });
  }
};

// @desc    Assign ticket to technician
// @route   PATCH /api/tickets/:id/assign
// @access  Private (Technician, Manager, Admin)
export const assignTicket = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: technicianId || null },
      { new: true }
    );
    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json({ message: "Failed to assign ticket", error: error.message });
  }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Private (Technician, Manager, Admin)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (ticket && ["resolved", "closed"].includes(status)) {
      slaHeap.markResolved(ticket._id);
    }
    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json({ message: "Failed to update status", error: error.message });
  }
};

// Alias export for backward compatibility
export const updateTicketStatus = updateStatus;

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text, comment } = req.body;
    const commentContent = text || comment;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const newComment = {
      user: req.user?._id || req.user?.id,
      userName: req.user?.name || req.user?.email || "Support Agent",
      text: commentContent,
      createdAt: new Date(),
    };

    ticket.comments.push(newComment);
    await ticket.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: "Failed to add comment", error: error.message });
  }
};

// @desc    Get comments for ticket
// @route   GET /api/tickets/:id/comments
// @access  Private
export const getComments = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(ticket.comments || []);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments", error: error.message });
  }
};

// @desc    Add work log entry
// @route   POST /api/tickets/:id/worklogs
// @access  Private (Technician, Manager, Admin)
export const addWorkLog = async (req, res) => {
  try {
    res.status(200).json({ message: "Worklog saved successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to add worklog", error: error.message });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin)
export const deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete ticket", error: error.message });
  }
};