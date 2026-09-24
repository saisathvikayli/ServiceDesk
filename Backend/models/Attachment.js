import { model, Schema } from "mongoose";
const attachmentSchema = new Schema({
    ticketId: {
        type: Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },

    fileUrl: {
        type: String,
        required: true
    },

    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default model("Attachment", attachmentSchema);

