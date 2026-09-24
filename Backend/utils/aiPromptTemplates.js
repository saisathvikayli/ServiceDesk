export const ticketSummaryPrompt = (ticket) => `
Summarize the following service desk ticket in a concise, professional style:

Title: ${ticket.title}
Description: ${ticket.description || "N/A"}
Status: ${ticket.status || "N/A"}
Priority: ${ticket.priorityId || "N/A"}
Department: ${ticket.departmentId || "N/A"}

Return: 3 bullet points with status, issue summary, and next action.
`;

export const resolutionSuggestionPrompt = (ticket) => `
Suggest a practical resolution plan for this ticket:

Title: ${ticket.title}
Description: ${ticket.description || "N/A"}
Category: ${ticket.categoryId || "N/A"}
Priority: ${ticket.priorityId || "N/A"}

Provide a brief recommended action plan and possible root cause.
`;
