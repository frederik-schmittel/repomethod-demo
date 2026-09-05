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
import type { ProjectRepository } from "../repositories/projectRepository.js";
import type { TaskRepository } from "../repositories/taskRepository.js";

const TITLE_MIN = 1;
const TITLE_MAX = 200;

export interface TaskService {
  listByProject(projectId: string): Task[];
  get(projectId: string, taskId: string): Task;
  create(projectId: string, input: CreateTaskInput): Task;
  update(projectId: string, taskId: string, input: UpdateTaskInput): Task;
  remove(projectId: string, taskId: string): void;
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
  taskRepo: TaskRepository,
  projectRepo: ProjectRepository,
  clock: Clock,
): TaskService {
  function assertProject(projectId: string): void {
    if (!projectRepo.getById(projectId)) {
      throw new NotFoundError("project", projectId);
    }
  }

  return {
    listByProject(projectId: string): Task[] {
      assertProject(projectId);
      return taskRepo.listByProject(projectId);
    },
    get(projectId: string, taskId: string): Task {
      assertProject(projectId);
      const task = taskRepo.getById(taskId);
      if (!task || task.projectId !== projectId) {
        throw new NotFoundError("task", taskId);
      }
      return task;
    },
    create(projectId: string, input: CreateTaskInput): Task {
      assertProject(projectId);
      const now = clock.now();
      const task: Task = {
        id: newId("tsk"),
        projectId,
        title: assertTitle(input.title),
        status: assertStatus(input.status, "open"),
        createdAt: now,
        updatedAt: now,
      };
      taskRepo.save(task);
      return task;
    },
    update(projectId: string, taskId: string, input: UpdateTaskInput): Task {
      const current = this.get(projectId, taskId);
      const next: Task = {
        ...current,
        title:
          input.title === undefined ? current.title : assertTitle(input.title),
        status: assertStatus(input.status, current.status),
        updatedAt: clock.now(),
      };
      taskRepo.save(next);
      return next;
    },
    remove(projectId: string, taskId: string): void {
      this.get(projectId, taskId);
      taskRepo.delete(taskId);
    },
  };
}
