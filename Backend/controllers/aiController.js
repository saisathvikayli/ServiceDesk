import { ticketSummaryPrompt, resolutionSuggestionPrompt } from "../utils/aiPromptTemplates.js";

export const summarizeTicket = async (req, res) => {
  try {
    const { ticket } = req.body;
    const summary = ticketSummaryPrompt(ticket);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const suggestTicketResolution = async (req, res) => {
  try {
    const { ticket } = req.body;
    const suggestion = resolutionSuggestionPrompt(ticket);
    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
