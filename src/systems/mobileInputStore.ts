type Listener = (x: number, y: number) => void;

class MobileInputStore {
  private x = 0;
  private y = 0;
  private listeners = new Set<Listener>();

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    for (const listener of this.listeners) listener(x, y);
  }

  get() {
    return { x: this.x, y: this.y };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const mobileInputStore = new MobileInputStore();
