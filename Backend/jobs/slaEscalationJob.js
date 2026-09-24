import cron from "node-cron";
import slaHeap from "../dsa/slaHeap.js";
import Ticket from "../models/Ticket.js";


cron.schedule("*/5 * * * *", async () => {
  const now = Date.now();
  let next = slaHeap.peek();

  while (next && next.dueAt <= now) {
    slaHeap.pop();

    try {
      const ticket = await Ticket.findById(next.ticketId);
      if (ticket && !["resolved", "closed"].includes(ticket.status) && !ticket.escalated) {
        ticket.escalated = true;
        ticket.status = "escalated";
        await ticket.save();
        console.log(`ticket ${ticket._id} escalated - breached sla`);
      }
    } catch (error) {
      console.error("sla escalation check failed for", next.ticketId, error.message);
    }

    next = slaHeap.peek();
  }
});

console.log("sla escalation job scheduled (every 5 min)");