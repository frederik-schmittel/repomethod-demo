import type { FastifyInstance } from "fastify";
import type { Container } from "../container.js";
import type { CreateTaskInput, UpdateTaskInput } from "../domain/types.js";
import { paginate, parsePagination } from "../lib/pagination.js";

interface TaskListParams {
  projectId: string;
}

interface TaskItemParams {
  projectId: string;
  taskId: string;
}

export async function taskRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  const { taskService } = container;

  app.get<{ Params: TaskListParams; Querystring: Record<string, unknown> }>(
    "/projects/:projectId/tasks",
    async (request) => {
      const all = taskService.listByProject(request.params.projectId);
      const pageRequest = parsePagination(request.query);
      return paginate(all, pageRequest);
    },
  );

  app.post<{ Params: TaskListParams; Body: CreateTaskInput }>(
    "/projects/:projectId/tasks",
    async (request, reply) => {
      const task = taskService.create(
        request.params.projectId,
        request.body ?? ({} as CreateTaskInput),
      );
      reply.code(201);
      return task;
    },
  );

  app.get<{ Params: TaskItemParams }>(
    "/projects/:projectId/tasks/:taskId",
    async (request) => {
      return taskService.get(request.params.projectId, request.params.taskId);
    },
  );

  app.patch<{ Params: TaskItemParams; Body: UpdateTaskInput }>(
    "/projects/:projectId/tasks/:taskId",
    async (request) => {
      return taskService.update(
        request.params.projectId,
        request.params.taskId,
        request.body ?? {},
      );
    },
  );

  app.delete<{ Params: TaskItemParams }>(
    "/projects/:projectId/tasks/:taskId",
    async (request, reply) => {
      taskService.remove(request.params.projectId, request.params.taskId);
      reply.code(204);
      return null;
    },
  );
}
