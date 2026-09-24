import { model, Schema } from "mongoose";

const commentSchema = new Schema({
	ticketId: {
		type: Schema.Types.ObjectId,
		ref: "Ticket",
		required: true
	},

	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},

	text: {
		type: String,
		required: true
	},

	internal: {
		type: Boolean,
		default: false
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

export default model("Comment", commentSchema);
