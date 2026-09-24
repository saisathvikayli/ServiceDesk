import dotenv from "dotenv";
dotenv.config();

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
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
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    return JSON.parse(response.choices[0].message.content.trim());
  } catch (err) {
    console.error("AI Classification Error:", err.message);
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
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });
    return JSON.parse(response.choices[0].message.content.trim());
  } catch (err) {
    console.error("AI KB Suggestion Error:", err.message);
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
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    return response.choices[0].message.content.trim();
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
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    return "Action Plan: Review application logs.\nRoot Cause: Unknown.";
  }
};