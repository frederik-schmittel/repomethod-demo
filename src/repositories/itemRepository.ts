import type { Item } from "../domain/types.js";

export interface ItemRepository {
  list(): Item[];
  getById(id: string): Item | undefined;
  save(item: Item): void;
  delete(id: string): boolean;
  clear(): void;
}

export function createInMemoryItemRepository(
  seed: readonly Item[] = [],
): ItemRepository {
  const store = new Map<string, Item>();
  for (const item of seed) {
    store.set(item.id, item);
  }

  return {
    list(): Item[] {
      return [...store.values()].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
    },
    getById(id: string): Item | undefined {
      return store.get(id);
    },
    save(item: Item): void {
      store.set(item.id, item);
    },
    delete(id: string): boolean {
      return store.delete(id);
    },
    clear(): void {
      store.clear();
    },
  };
}
