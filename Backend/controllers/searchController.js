import searchTrie from "../dsa/searchTrie.js";

export const autocomplete = (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q.trim()) {
      return res.json([]);
    }

    const matches = searchTrie.search(q);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};