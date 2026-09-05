import type { Project } from "../domain/types.js";

export interface ProjectRepository {
  list(): Project[];
  getById(id: string): Project | undefined;
  save(project: Project): void;
  delete(id: string): boolean;
  clear(): void;
}

export function createInMemoryProjectRepository(
  seed: readonly Project[] = [],
): ProjectRepository {
  const store = new Map<string, Project>();
  for (const project of seed) {
    store.set(project.id, project);
  }

  return {
    list(): Project[] {
      return [...store.values()].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
    },
    getById(id: string): Project | undefined {
      return store.get(id);
    },
    save(project: Project): void {
      store.set(project.id, project);
    },
    delete(id: string): boolean {
      return store.delete(id);
    },
    clear(): void {
      store.clear();
    },
  };
}
