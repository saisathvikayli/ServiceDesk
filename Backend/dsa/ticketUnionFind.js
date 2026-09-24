// union-find (disjoint set) keyed by ticket id strings, since ticket ids are
// mongo ObjectIds, not sequential array indices. sets are created lazily the
// first time an id is seen, via makeSet().
class TicketUnionFind {
  constructor() {
    this.parent = new Map();
    this.rank = new Map();
  }

  makeSet(id) {
    if (!this.parent.has(id)) {
      this.parent.set(id, id);
      this.rank.set(id, 0);
    }
  }

  find(id) {
    this.makeSet(id);
    if (this.parent.get(id) !== id) {
      this.parent.set(id, this.find(this.parent.get(id)));
    }
    return this.parent.get(id);
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    if (this.rank.get(rootX) < this.rank.get(rootY)) {
      this.parent.set(rootX, rootY);
    } else if (this.rank.get(rootX) > this.rank.get(rootY)) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, this.rank.get(rootX) + 1);
    }

    return true;
  }
}

// single shared instance - ticketController imports this same object
const ticketUnionFind = new TicketUnionFind();
export default ticketUnionFind;