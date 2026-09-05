import type { FastifyInstance } from "fastify";
import type { Container } from "../container.js";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "../domain/types.js";

interface ProjectParams {
  projectId: string;
}

export async function projectRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  const { projectService } = container;

  app.get("/projects", async () => {
    return { items: projectService.list() };
  });

  app.post<{ Body: CreateProjectInput }>("/projects", async (request, reply) => {
    const project = projectService.create(request.body ?? ({} as CreateProjectInput));
    reply.code(201);
    return project;
  });

  app.get<{ Params: ProjectParams }>(
    "/projects/:projectId",
    async (request) => {
      return projectService.get(request.params.projectId);
    },
  );

  app.patch<{ Params: ProjectParams; Body: UpdateProjectInput }>(
    "/projects/:projectId",
    async (request) => {
      return projectService.update(
        request.params.projectId,
        request.body ?? {},
      );
    },
  );

  app.delete<{ Params: ProjectParams }>(
    "/projects/:projectId",
    async (request, reply) => {
      projectService.remove(request.params.projectId);
      reply.code(204);
      return null;
    },
  );
}
