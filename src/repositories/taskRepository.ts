import type { Task } from "../domain/types.js";

export interface TaskRepository {
  listByProject(projectId: string): Task[];
  getById(id: string): Task | undefined;
  save(task: Task): void;
  delete(id: string): boolean;
  deleteByProject(projectId: string): number;
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
    listByProject(projectId: string): Task[] {
      return [...store.values()]
        .filter((task) => task.projectId === projectId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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
    deleteByProject(projectId: string): number {
      let removed = 0;
      for (const [id, task] of store) {
        if (task.projectId === projectId) {
          store.delete(id);
          removed += 1;
        }
      }
      return removed;
    },
    clear(): void {
      store.clear();
    },
  };
}
