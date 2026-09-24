class TicketDependencyGraph {
  constructor() {
    this.graph = new Map();
  }

  addTicket(ticketId) {
    if (!this.graph.has(ticketId)) {
      this.graph.set(ticketId, new Set());
    }
  }

  addDependency(ticketId, dependsOnId) {
    this.addTicket(ticketId);
    this.addTicket(dependsOnId);
    this.graph.get(ticketId).add(dependsOnId);
  }

  topologicalSort() {
    const inDegree = new Map();
    const queue = [];

    for (const [ticketId, dependencies] of this.graph.entries()) {
      if (!inDegree.has(ticketId)) inDegree.set(ticketId, 0);
      for (const dependency of dependencies) {
        inDegree.set(dependency, (inDegree.get(dependency) || 0) + 1);
      }
    }

    for (const [ticketId, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(ticketId);
    }

    const order = [];
    while (queue.length) {
      const current = queue.shift();
      order.push(current);

      for (const [ticketId, dependencies] of this.graph.entries()) {
        if (dependencies.has(current)) {
          const updatedDegree = (inDegree.get(ticketId) || 1) - 1;
          inDegree.set(ticketId, updatedDegree);
          if (updatedDegree === 0) queue.push(ticketId);
        }
      }
    }

    if (order.length !== this.graph.size) {
      throw new Error("Cycle detected in ticket dependency graph");
    }

    return order;
  }
}

export default TicketDependencyGraph;
