import Fastify, {
  type FastifyError,
  type FastifyInstance,
} from "fastify";
import { createContainer, type ContainerOverrides } from "./container.js";
import { isDomainError } from "./domain/errors.js";
import { healthRoutes } from "./routes/health.js";
import { itemRoutes } from "./routes/items.js";
import { taskRoutes } from "./routes/tasks.js";

export interface BuildAppOptions {
  logger?: boolean;
  container?: ContainerOverrides;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const container = createContainer(options.container);

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (isDomainError(error)) {
      reply.code(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
      return;
    }
    if (error.validation) {
      reply.code(400).send({
        error: {
          code: "bad_request",
          message: error.message,
        },
      });
      return;
    }
    reply.code(500).send({
      error: { code: "internal_error", message: "internal server error" },
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: {
        code: "not_found",
        message: `route ${request.method} ${request.url} not found`,
      },
    });
  });

  app.register(async (instance) => {
    await healthRoutes(instance);
    await itemRoutes(instance, container);
    await taskRoutes(instance, container);
  });

  return app;
}
