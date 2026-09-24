import { model, Schema } from "mongoose";

const worklogSchema = new Schema({
    ticketId: {
        type: Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },

    technicianId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    hoursSpent: {
        type: Number,
        required: true
    },

    note: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default model("Worklog", worklogSchema);
