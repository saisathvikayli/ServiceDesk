import express from "express";
import {
  createKnowledgeArticle,
  getKnowledgeArticles,
  getKnowledgeArticleById,
  updateKnowledgeArticle,
  deleteKnowledgeArticle,
} from "../controllers/knowledgeArticleController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getKnowledgeArticles);
router.get("/:id", getKnowledgeArticleById);
router.use(protect);
router.post("/", authorize("admin", "agent"), createKnowledgeArticle);
router.put("/:id", authorize("admin", "agent"), updateKnowledgeArticle);
router.delete("/:id", authorize("admin"), deleteKnowledgeArticle);

export default router;
