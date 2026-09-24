class SlaHeap {
  constructor() {
    this.heap = []; // { ticketId, dueAt }
    this.resolvedSet = new Set();
  }

  push(ticketId, dueAt) {
    if (!dueAt) return;
    this.heap.push({ ticketId: ticketId.toString(), dueAt: new Date(dueAt).getTime() });
    this._bubbleUp(this.heap.length - 1);
  }

  // marks a ticket done so the heap skips it without a real O(n) delete
  markResolved(ticketId) {
    this.resolvedSet.add(ticketId.toString());
  }

  // drops resolved entries sitting at the top of the heap
  _skipResolved() {
    while (this.heap.length && this.resolvedSet.has(this.heap[0].ticketId)) {
      this._popRaw();
    }
  }

  peek() {
    this._skipResolved();
    return this.heap[0] || null;
  }

  pop() {
    this._skipResolved();
    return this._popRaw();
  }

  _popRaw() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const top = this.heap[0];
    const last = this.heap.pop();
    this.heap[0] = last;
    this._bubbleDown(0);
    return top;
  }

  _bubbleUp(index) {
    const parentIndex = Math.floor((index - 1) / 2);
    if (index <= 0 || this.heap[parentIndex].dueAt <= this.heap[index].dueAt) return;

    [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
    this._bubbleUp(parentIndex);
  }

  _bubbleDown(index) {
    const left = index * 2 + 1;
    const right = index * 2 + 2;
    let smallest = index;

    if (left < this.heap.length && this.heap[left].dueAt < this.heap[smallest].dueAt) {
      smallest = left;
    }
    if (right < this.heap.length && this.heap[right].dueAt < this.heap[smallest].dueAt) {
      smallest = right;
    }

    if (smallest !== index) {
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      this._bubbleDown(smallest);
    }
  }

  async rebuildFromDB(Ticket) {
    this.heap = [];
    this.resolvedSet = new Set();

    const openTickets = await Ticket.find({
      status: { $nin: ["resolved", "closed"] },
      dueAt: { $ne: null },
    });

    openTickets.forEach((ticket) => this.push(ticket._id, ticket.dueAt));
  }
}

const slaHeap = new SlaHeap();
export default slaHeap;