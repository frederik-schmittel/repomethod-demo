import { NotFoundError, ValidationError } from "../domain/errors.js";
import {
  isTaskStatus,
  type CreateTaskInput,
  type Task,
  type TaskStatus,
  type UpdateTaskInput,
} from "../domain/types.js";
import type { Clock } from "../lib/clock.js";
import { newId } from "../lib/id.js";
import type { TaskRepository } from "../repositories/taskRepository.js";

const TITLE_MIN = 1;
const TITLE_MAX = 200;

export interface TaskService {
  list(): Task[];
  get(id: string): Task;
  create(input: CreateTaskInput): Task;
  update(id: string, input: UpdateTaskInput): Task;
  remove(id: string): void;
}

function assertTitle(title: unknown): string {
  if (typeof title !== "string" || title.trim().length < TITLE_MIN) {
    throw new ValidationError("title is required");
  }
  const trimmed = title.trim();
  if (trimmed.length > TITLE_MAX) {
    throw new ValidationError(`title must be at most ${TITLE_MAX} characters`);
  }
  return trimmed;
}

function assertStatus(status: unknown, fallback: TaskStatus): TaskStatus {
  if (status === undefined) {
    return fallback;
  }
  if (!isTaskStatus(status)) {
    throw new ValidationError("status is not a valid task status", {
      status: String(status),
    });
  }
  return status;
}

export function createTaskService(
  repo: TaskRepository,
  clock: Clock,
): TaskService {
  return {
    list(): Task[] {
      return repo.list();
    },
    get(id: string): Task {
      const task = repo.getById(id);
      if (!task) {
        throw new NotFoundError("task", id);
      }
      return task;
    },
    create(input: CreateTaskInput): Task {
      const now = clock.now();
      const task: Task = {
        id: newId("tsk"),
        title: assertTitle(input.title),
        status: assertStatus(input.status, "open"),
        createdAt: now,
        updatedAt: now,
      };
      repo.save(task);
      return task;
    },
    update(id: string, input: UpdateTaskInput): Task {
      const current = this.get(id);
      const next: Task = {
        ...current,
        title:
          input.title === undefined ? current.title : assertTitle(input.title),
        status: assertStatus(input.status, current.status),
        updatedAt: clock.now(),
      };
      repo.save(next);
      return next;
    },
    remove(id: string): void {
      const existed = repo.delete(id);
      if (!existed) {
        throw new NotFoundError("task", id);
      }
    },
  };
}
