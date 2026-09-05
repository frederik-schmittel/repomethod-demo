import type { FastifyInstance } from "fastify";
import type { Container } from "../container.js";
import type { CreateTaskInput, UpdateTaskInput } from "../domain/types.js";
import { paginate, parsePagination } from "../lib/pagination.js";

interface TaskParams {
  taskId: string;
}

export async function taskRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  const { taskService } = container;

  // Reference implementation of a paginated list endpoint: page + limit query
  // params, defaults applied, invalid input rejected with 400, and a
  // pagination metadata block on the response.
  app.get<{ Querystring: Record<string, unknown> }>(
    "/tasks",
    async (request) => {
      const all = taskService.list();
      return paginate(all, parsePagination(request.query));
    },
  );

  app.post<{ Body: CreateTaskInput }>("/tasks", async (request, reply) => {
    const task = taskService.create(request.body ?? ({} as CreateTaskInput));
    reply.code(201);
    return task;
  });

  app.get<{ Params: TaskParams }>("/tasks/:taskId", async (request) => {
    return taskService.get(request.params.taskId);
  });

  app.patch<{ Params: TaskParams; Body: UpdateTaskInput }>(
    "/tasks/:taskId",
    async (request) => {
      return taskService.update(request.params.taskId, request.body ?? {});
    },
  );

  app.delete<{ Params: TaskParams }>(
    "/tasks/:taskId",
    async (request, reply) => {
      taskService.remove(request.params.taskId);
      reply.code(204);
      return null;
    },
  );
}
