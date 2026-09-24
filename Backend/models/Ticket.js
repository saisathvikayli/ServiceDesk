import { model, Schema } from "mongoose";
const ticketSchema = new Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },

    priorityId: {
        type: Schema.Types.ObjectId,
        ref: "Priority"
    },

    status: {
        type: String
    },

    raisedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    departmentId: {
        type: Schema.Types.ObjectId,
        ref: "Department"
    },

    dueAt: {
        type: Date
    },

    escalated: {
        type: Boolean,
        default: false
    },

    groupRootId: {
        type: Schema.Types.ObjectId,
        ref: "Ticket"
    },

    dependsOn: [{
        type: Schema.Types.ObjectId,
        ref: "Ticket"
    }],

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default model("Ticket", ticketSchema);