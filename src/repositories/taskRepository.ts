import type { Task } from "../domain/types.js";

export interface TaskRepository {
  list(): Task[];
  getById(id: string): Task | undefined;
  save(task: Task): void;
  delete(id: string): boolean;
  clear(): void;
}

export function createInMemoryTaskRepository(
  seed: readonly Task[] = [],
): TaskRepository {
  const store = new Map<string, Task>();
  for (const task of seed) {
    store.set(task.id, task);
  }

  return {
    list(): Task[] {
      return [...store.values()].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
    },
    getById(id: string): Task | undefined {
      return store.get(id);
    },
    save(task: Task): void {
      store.set(task.id, task);
    },
    delete(id: string): boolean {
      return store.delete(id);
    },
    clear(): void {
      store.clear();
    },
  };
}
