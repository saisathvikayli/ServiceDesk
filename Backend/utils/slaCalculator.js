export const calculateDueDate = (priorityName) => {
  const hoursMap = {
    p1: 2,        // Critical/Urgent: 2 hours
    high: 4,      // High Priority: 4 hours
    medium: 24,   // Medium: 24 hours
    low: 48       // Low: 48 hours
  };

  const key = priorityName ? priorityName.toLowerCase() : 'medium';
  const hours = hoursMap[key] || 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

export const checkAndFlagSlaBreaches = async (TicketModel) => {
  const now = new Date();
  
  // Flag open or in-progress tickets where dueAt has passed
  await TicketModel.updateMany(
    {
      dueAt: { $lt: now },
      status: { $nin: ['resolved', 'closed'] },
      isEscalated: false
    },
    {
      $set: { isEscalated: true, escalatedAt: now }
    }
  );
};