import cron from "node-cron";
import SlaHeap from "../dsa/slaHeap.js";

const heap = new SlaHeap();

cron.schedule("*/5 * * * *", () => {
  console.log("Running SLA escalation check...");

  if (heap.peek()) {
    console.log("Pending SLA jobs:", heap.peek());
  } else {
    console.log("No active SLA jobs");
  }
});

export default heap;
