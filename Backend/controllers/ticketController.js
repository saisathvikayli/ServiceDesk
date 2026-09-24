import Ticket from "../models/Ticket.js";
import Comment from "../models/Comment.js";
import WorkLog from "../models/Worklog.js";
import Priority from "../models/Priority.js";
import slaHeap from "../dsa/slaHeap.js";
import ticketUnionFind from "../dsa/ticketUnionFind.js";
import searchTrie from "../dsa/searchTrie.js";
import { classifyTicketPrompt } from "../utils/aiPromptTemplates.js";


// works out the due date from the priority's slaHours, so tickets always get
// a due date the moment they're created
const computeDueAt = async (priorityId) => {
  if (!priorityId) return undefined;
  const priority = await Priority.findById(priorityId);
  if (!priority) return undefined;
  return new Date(Date.now() + priority.slaHours * 60 * 60 * 1000);
};

// splits a title into lowercase words so two titles can be compared
const wordSet = (title) => new Set((title || "").toLowerCase().split(/\s+/).filter(Boolean));

// fraction of the smaller title's words that also appear in the other title
const similarity = (a, b) => {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / Math.min(a.size, b.size);
};

// looks for recent open tickets with a similar title in the same category,
// and groups them under one root using the union-find
const detectDuplicate = async (ticket) => {
  if (!ticket.categoryId) return;

  const candidates = await Ticket.find({
    _id: { $ne: ticket._id },
    categoryId: ticket.categoryId,
    status: { $nin: ["resolved", "closed"] },
  }).sort({ createdAt: -1 }).limit(50);

  const newWords = wordSet(ticket.title);
  let matched = false;

  for (const candidate of candidates) {
    if (similarity(newWords, wordSet(candidate.title)) >= 0.6) {
      ticketUnionFind.union(ticket._id.toString(), candidate._id.toString());
      matched = true;
    }
  }

  if (matched) {
    ticket.groupRootId = ticketUnionFind.find(ticket._id.toString());
    await ticket.save();
  }
};

export const createTicket = async (req, res) => {
  try {
    let { categoryId, priorityId, title, description } = req.body;

    // AI Classification run if priority/category is missing
    if (!categoryId || !priorityId) {
      const aiMeta = await classifyTicketPrompt(title, description);
      
      // Assign priority from AI if not explicitly provided
      if (!priorityId && aiMeta.priority) {
        const foundPriority = await Priority.findOne({
          name: new RegExp(`^${aiMeta.priority}$`, "i"),
        });
        if (foundPriority) priorityId = foundPriority._id;
      }
    }

    const dueAt = await computeDueAt(priorityId);

    const ticket = await Ticket.create({
      ...req.body,
      categoryId,
      priorityId,
      raisedBy: req.user.id,
      departmentId: req.body.departmentId || req.user.departmentId,
      dueAt,
    });

    if (ticket.dueAt) {
      slaHeap.push(ticket._id, ticket.dueAt);
    }

    searchTrie.insert(ticket.title);
    await detectDuplicate(ticket);

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// employees only see their own tickets, technicians see what's assigned to them,
// managers see their department, admin sees everything
export const getTickets = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "employee") {
      filter.raisedBy = req.user.id;
    } else if (req.user.role === "technician") {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === "manager") {
      filter.departmentId = req.user.departmentId;
    }
    // admin: no filter, sees everything

    const tickets = await Ticket.find(filter);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    slaHeap.markResolved(ticket._id);

    res.json({ message: "Ticket deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// hands a ticket to a technician, moves it out of "open" if it's still there
export const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.assignedTo = assignedTo;
    if (ticket.status === "open") {
      ticket.status = "assigned";
    }

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = status;
    await ticket.save();

    // resolved/closed before breaching - lazy-remove it from the heap
    if (["resolved", "closed"].includes(status)) {
      slaHeap.markResolved(ticket._id);

      // resolving the root auto-resolves the rest of the group
      const groupTickets = await Ticket.find({
        groupRootId: ticket._id,
        status: { $nin: ["resolved", "closed"] },
      });

      for (const member of groupTickets) {
        member.status = status;
        await member.save();
        slaHeap.markResolved(member._id);
      }
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// real Comment documents now, instead of pushing onto a field the schema didn't have
export const addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const comment = await Comment.create({
      ticketId: ticket._id,
      userId: req.user.id,
      text: req.body.text,
      internal: Boolean(req.body.internal),
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ ticketId: req.params.id }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addWorkLog = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const workLog = await WorkLog.create({
      ticketId: ticket._id,
      technicianId: req.user.id,
      hoursSpent: req.body.hoursSpent,
      note: req.body.note,
    });

    res.status(201).json(workLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};