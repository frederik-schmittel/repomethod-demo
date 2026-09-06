import { afterEach, beforeEach, expect, test } from "vitest";
import { buildTestApp, createItem } from "./helpers/buildTestApp.js";

let app: ReturnType<typeof buildTestApp>;

beforeEach(() => {
  app = buildTestApp();
});

afterEach(async () => {
  await app.close();
});

async function seedItems(count: number): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await createItem(app, `Item ${i + 1}`);
  }
}

test("creates and reads an item", async () => {
  const created = await app.inject({
    method: "POST",
    url: "/items",
    payload: { name: "Widget", description: "a small widget" },
  });
  expect(created.statusCode).toBe(201);
  const body = created.json();
  expect(body).toMatchObject({ name: "Widget", description: "a small widget" });

  const fetched = await app.inject({ method: "GET", url: `/items/${body.id}` });
  expect(fetched.statusCode).toBe(200);
  expect(fetched.json().id).toBe(body.id);
});

test("rejects an item without a name", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/items",
    payload: { description: "no name" },
  });
  expect(response.statusCode).toBe(422);
  expect(response.json().error.code).toBe("validation_error");
});

test("GET /items is paginated with a pagination block", async () => {
  await seedItems(25);

  const first = await app.inject({ method: "GET", url: "/items?limit=10" });
  expect(first.statusCode).toBe(200);
  expect(first.json().items).toHaveLength(10);
  expect(first.json().pagination).toMatchObject({
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3,
    hasMore: true,
  });

  const last = await app.inject({
    method: "GET",
    url: "/items?page=3&limit=10",
  });
  expect(last.json().items).toHaveLength(5);
  expect(last.json().pagination.hasMore).toBe(false);
});

test("GET /items applies pagination defaults", async () => {
  await seedItems(3);
  const response = await app.inject({ method: "GET", url: "/items" });
  expect(response.json().pagination).toMatchObject({ page: 1, limit: 20 });
});

test("GET /items rejects invalid pagination with 400", async () => {
  const invalidLimit = await app.inject({
    method: "GET",
    url: "/items?limit=999",
  });
  expect(invalidLimit.statusCode).toBe(400);

  const invalidPage = await app.inject({
    method: "GET",
    url: "/items?page=abc",
  });
  expect(invalidPage.statusCode).toBe(400);
});

test("updates an item name", async () => {
  const item = await createItem(app, "Old name");
  const response = await app.inject({
    method: "PATCH",
    url: `/items/${item.id}`,
    payload: { name: "New name" },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json().name).toBe("New name");
});

test("deletes an item", async () => {
  const item = await createItem(app, "Doomed");
  const del = await app.inject({ method: "DELETE", url: `/items/${item.id}` });
  expect(del.statusCode).toBe(204);

  const fetched = await app.inject({ method: "GET", url: `/items/${item.id}` });
  expect(fetched.statusCode).toBe(404);
});
