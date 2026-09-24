import { model, Schema } from "mongoose";

const slaSchema = new Schema({
    priorityId: {
        type: Schema.Types.ObjectId,
        ref: "Priority",
        required: true
    },

    responseHours: {
        type: Number,
        required: true
    },

    resolutionHours: {
        type: Number,
        required: true
    },

    businessHoursOnly: {
        type: Boolean,
        default: false
    }
});

export default model("SLAPolicy", slaSchema);