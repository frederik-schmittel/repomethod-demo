import { NotFoundError, ValidationError } from "../domain/errors.js";
import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from "../domain/types.js";
import type { Clock } from "../lib/clock.js";
import { newId } from "../lib/id.js";
import type { ProjectRepository } from "../repositories/projectRepository.js";

const NAME_MIN = 1;
const NAME_MAX = 120;
const DESCRIPTION_MAX = 2000;

export interface ProjectService {
  list(): Project[];
  get(id: string): Project;
  create(input: CreateProjectInput): Project;
  update(id: string, input: UpdateProjectInput): Project;
  remove(id: string): void;
}

function assertName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length < NAME_MIN) {
    throw new ValidationError("name is required");
  }
  const trimmed = name.trim();
  if (trimmed.length > NAME_MAX) {
    throw new ValidationError(`name must be at most ${NAME_MAX} characters`);
  }
  return trimmed;
}

function assertDescription(description: unknown): string {
  if (description === undefined || description === null) {
    return "";
  }
  if (typeof description !== "string") {
    throw new ValidationError("description must be a string");
  }
  if (description.length > DESCRIPTION_MAX) {
    throw new ValidationError(
      `description must be at most ${DESCRIPTION_MAX} characters`,
    );
  }
  return description;
}

export function createProjectService(
  repo: ProjectRepository,
  clock: Clock,
): ProjectService {
  return {
    list(): Project[] {
      return repo.list();
    },
    get(id: string): Project {
      const project = repo.getById(id);
      if (!project) {
        throw new NotFoundError("project", id);
      }
      return project;
    },
    create(input: CreateProjectInput): Project {
      const now = clock.now();
      const project: Project = {
        id: newId("prj"),
        name: assertName(input.name),
        description: assertDescription(input.description),
        createdAt: now,
        updatedAt: now,
      };
      repo.save(project);
      return project;
    },
    update(id: string, input: UpdateProjectInput): Project {
      const current = this.get(id);
      const next: Project = {
        ...current,
        name: input.name === undefined ? current.name : assertName(input.name),
        description:
          input.description === undefined
            ? current.description
            : assertDescription(input.description),
        updatedAt: clock.now(),
      };
      repo.save(next);
      return next;
    },
    remove(id: string): void {
      const existed = repo.delete(id);
      if (!existed) {
        throw new NotFoundError("project", id);
      }
    },
  };
}
