import { model, Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "please enter username to proceed"],
        unique: true,
        trim: true,
    },

    email: {
        type: String,
        required: [true, "enter email to proceed"],
        unique: true,
    },

    // this stores the bcrypt hash, never the raw password
    passwordHash: {
        type: String,
        required: true,
        minlength: 8,
    },

    // matches the 4 roles from the docs, lowercase to keep string checks simple
    role: {
        type: String,
        required: true,
        enum: ["admin", "manager", "technician", "employee"],
    },

    departmentId: {
        type: Schema.Types.ObjectId,
        ref: "Department",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default model("User", userSchema);