class SlaHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const top = this.heap[0];
    const last = this.heap.pop();
    this.heap[0] = last;
    this._bubbleDown(0);
    return top;
  }

  peek() {
    return this.heap[0] || null;
  }

  _bubbleUp(index) {
    const parentIndex = Math.floor((index - 1) / 2);
    if (index <= 0 || this.heap[parentIndex].priority <= this.heap[index].priority) return;

    [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
    this._bubbleUp(parentIndex);
  }

  _bubbleDown(index) {
    const left = index * 2 + 1;
    const right = index * 2 + 2;
    let smallest = index;

    if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
      smallest = left;
    }

    if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
      smallest = right;
    }

    if (smallest !== index) {
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      this._bubbleDown(smallest);
    }
  }
}

export default SlaHeap;
