import type { FastifyInstance } from "fastify";
import type { Container } from "../container.js";
import type { CreateItemInput, UpdateItemInput } from "../domain/types.js";

interface ItemParams {
  itemId: string;
}

export async function itemRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  const { itemService } = container;

  // NOTE: this endpoint returns every item at once. Pagination is intentionally
  // not implemented here yet; see specs/add-items-pagination.md.
  app.get("/items", async () => {
    return { items: itemService.list() };
  });

  app.post<{ Body: CreateItemInput }>("/items", async (request, reply) => {
    const item = itemService.create(request.body ?? ({} as CreateItemInput));
    reply.code(201);
    return item;
  });

  app.get<{ Params: ItemParams }>("/items/:itemId", async (request) => {
    return itemService.get(request.params.itemId);
  });

  app.patch<{ Params: ItemParams; Body: UpdateItemInput }>(
    "/items/:itemId",
    async (request) => {
      return itemService.update(request.params.itemId, request.body ?? {});
    },
  );

  app.delete<{ Params: ItemParams }>(
    "/items/:itemId",
    async (request, reply) => {
      itemService.remove(request.params.itemId);
      reply.code(204);
      return null;
    },
  );
}
