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
// technicians write kb articles day-to-day, admin can too
router.post("/", authorize("admin", "technician"), createKnowledgeArticle);
router.put("/:id", authorize("admin", "technician"), updateKnowledgeArticle);
router.delete("/:id", authorize("admin"), deleteKnowledgeArticle);

export default router;