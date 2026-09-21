export type JournalEntry = {
  id: string;
  title: string;
  body: string;
};

type Listener = () => void;

class JournalStore {
  private entries = new Map<string, JournalEntry>();
  private listeners = new Set<Listener>();

  add(entry: JournalEntry) {
    if (this.entries.has(entry.id)) return false;
    this.entries.set(entry.id, entry);
    this.emit();
    return true;
  }

  getAll() {
    return [...this.entries.values()];
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}

export const journalStore = new JournalStore();
