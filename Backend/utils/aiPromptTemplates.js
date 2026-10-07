import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Helper to extract clean JSON from Gemini responses wrapped in markdown code blocks
 */
const parseJSON = (text) => {
  const cleaned = text.replace(/```json\n?|```/g, "").trim();
  return JSON.parse(cleaned);
};

/**
 * Classifies ticket text into category, priority, and root cause analysis
 */
export const classifyTicketPrompt = async (title, description) => {
  const prompt = `
You are an IT Helpdesk AI assistant. Analyze the following ticket title and description:
Title: "${title}"
Description: "${description}"

Respond strictly with a JSON object matching this schema:
{
  "category": "string",
  "priority": "Low | Medium | High | Critical",
  "probableIssue": "string"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJSON(text);
  } catch (err) {
    console.warn("AI Classification Warning (Gemini):", err.message);
    return {
      category: "General",
      priority: "Medium",
      probableIssue: "Unable to classify issue automatically.",
    };
  }
};

/**
 * Compares ticket context against KB articles to find top matches
 */
export const suggestKBPrompt = async (ticketTitle, ticketDescription, kbArticles) => {
  const articlesContext = kbArticles
    .map((a) => `ID: ${a._id} | Title: "${a.title}" | Tags: ${a.tags?.join(", ")}`)
    .join("\n");

  const prompt = `
Ticket Title: "${ticketTitle}"
Ticket Description: "${ticketDescription}"

Knowledge Base Articles:
${articlesContext}

Select up to 3 most relevant Knowledge Base article IDs for resolving this ticket.
Respond strictly with a JSON array of string IDs: ["id1", "id2"]
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJSON(text);
  } catch (err) {
    console.warn("AI KB Suggestion Warning (Gemini):", err.message);
    return [];
  }
};

/**
 * Generates concise 3-bullet summary for a ticket
 */
export const ticketSummaryPrompt = async (ticket) => {
  const prompt = `
Summarize the following service desk ticket in a concise, professional style:

Title: ${ticket.title}
Description: ${ticket.description || "N/A"}
Status: ${ticket.status || "N/A"}
Priority: ${ticket.priorityId || "N/A"}
Department: ${ticket.departmentId || "N/A"}

Return 3 bullet points covering: status, issue summary, and next recommended action.
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    return "• Status: Pending\n• Issue: Summary unavailable\n• Action: Inspect ticket details";
  }
};

/**
 * Recommends resolution steps and root cause
 */
export const resolutionSuggestionPrompt = async (ticket) => {
  const prompt = `
Suggest a practical resolution plan for this ticket:

Title: ${ticket.title}
Description: ${ticket.description || "N/A"}
Category: ${ticket.categoryId || "N/A"}
Priority: ${ticket.priorityId || "N/A"}

Provide a brief recommended action plan and probable root cause.
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    return "Action Plan: Review application logs.\nRoot Cause: Unknown.";
  }
};