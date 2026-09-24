import { model, Schema } from "mongoose";

const slaSchema = new Schema({
    priorityId: {
        type: Number,
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
        type: Number,
        required: true
    }
});

export default model("SLAPolicy", slaSchema);