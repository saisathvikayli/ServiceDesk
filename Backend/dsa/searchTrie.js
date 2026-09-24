class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

class SearchTrie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    const normalized = word.toLowerCase();

    for (const char of normalized) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }

    node.isEndOfWord = true;
  }

  search(prefix) {
    let node = this.root;
    const normalized = prefix.toLowerCase();

    for (const char of normalized) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char);
    }

    return this._collect(node, normalized);
  }

  _collect(node, prefix, results = []) {
    if (node.isEndOfWord) results.push(prefix);

    for (const [char, child] of node.children.entries()) {
      this._collect(child, prefix + char, results);
    }

    return results;
  }

  // rebuilds the trie from every ticket title and kb article title
  // call this once on server startup
  async rebuildFromDB(Ticket, KnowledgeArticle) {
    this.root = new TrieNode();

    const tickets = await Ticket.find({}, "title");
    const articles = await KnowledgeArticle.find({}, "title");

    tickets.forEach((ticket) => this.insert(ticket.title));
    articles.forEach((article) => this.insert(article.title));
  }
}

// single shared instance - ticketController, knowledgeArticleController, and
// server startup all import this same object
const searchTrie = new SearchTrie();
export default searchTrie;