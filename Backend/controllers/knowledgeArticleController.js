import KnowledgeArticle from "../models/KnowledgeArticle.js";
import LruCache from "../dsa/lruCache.js";
import searchTrie from "../dsa/searchTrie.js";

// technicians reopen the same handful of articles a lot - cache the last 50 they viewed
const articleCache = new LruCache(50);

export const createKnowledgeArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.create(req.body);
    searchTrie.insert(article.title);
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
    const cached = articleCache.get(req.params.id);
    if (cached) {
      return res.json(cached);
    }

    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    articleCache.set(req.params.id, article);
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateKnowledgeArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ message: "Article not found" });

    // drop the stale cached copy so the next GET picks up the new version
    articleCache.delete(req.params.id);

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteKnowledgeArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    articleCache.delete(req.params.id);

    res.json({ message: "Article deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};