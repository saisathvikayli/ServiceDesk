import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "pending", "resolved", "closed", "escalated"],
      default: "open",
    },
    priority: { type: mongoose.Schema.Types.ObjectId, ref: "Priority" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date },
    dueAt: { type: Date },
    slaBreached: { type: Boolean, default: false },
    isEscalated: { type: Boolean, default: false },
    escalatedAt: { type: Date },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: { type: String },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;