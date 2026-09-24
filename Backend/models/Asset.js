import { model, Schema } from "mongoose";

const assetSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    serialNo: {
        type: String,
        required: true,
        unique: true
    },

    status: {
        type: String,
        required: true
    },

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    vendorId: {
        type: Schema.Types.ObjectId,
        ref: "Vendor"
    },

    purchaseDate: {
        type: Date
    },

    retiredAt: {
        type: Date
    }
});

export default model("Asset", assetSchema);
