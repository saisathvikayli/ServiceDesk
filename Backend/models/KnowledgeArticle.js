import { model, Schema } from "mongoose";

const knowledgeArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("KnowledgeArticle", knowledgeArticleSchema);
