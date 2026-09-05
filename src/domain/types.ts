export type TaskStatus = "open" | "in_progress" | "done";

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  status?: TaskStatus;
}

export const TASK_STATUSES: readonly TaskStatus[] = [
  "open",
  "in_progress",
  "done",
];

export function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" &&
    (TASK_STATUSES as readonly string[]).includes(value)
  );
}
