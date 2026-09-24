import KnowledgeArticle from "../models/KnowledgeArticle.js";

export const createKnowledgeArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getKnowledgeArticles = async (_req, res) => {
  try {
    const articles = await KnowledgeArticle.find();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getKnowledgeArticleById = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateKnowledgeArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteKnowledgeArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
