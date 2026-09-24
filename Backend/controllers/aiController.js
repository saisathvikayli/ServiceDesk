import Ticket from "../models/Ticket.js";
import KnowledgeArticle from "../models/KnowledgeArticle.js";
import {
  classifyTicketPrompt,
  suggestKBPrompt,
  ticketSummaryPrompt,
  resolutionSuggestionPrompt,
} from "../utils/aiPromptTemplates.js";

// POST /api/ai/classify
export const classifyTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const result = await classifyTicketPrompt(title, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ai/suggest-kb
export const suggestKBArticles = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const kbArticles = await KnowledgeArticle.find({}, "_id title tags").limit(30);
    const matchedIds = await suggestKBPrompt(ticket.title, ticket.description, kbArticles);

    const suggestions = await KnowledgeArticle.find({ _id: { $in: matchedIds } });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ai/summarize
export const summarizeTicket = async (req, res) => {
  try {
    const { ticket } = req.body;
    const summary = await ticketSummaryPrompt(ticket);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ai/suggest-resolution
export const suggestTicketResolution = async (req, res) => {
  try {
    const { ticket } = req.body;
    const suggestion = await resolutionSuggestionPrompt(ticket);
    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};