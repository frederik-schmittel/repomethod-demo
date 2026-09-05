import { afterEach, beforeEach, expect, test } from "vitest";
import { buildTestApp, createItem } from "./helpers/buildTestApp.js";

let app: ReturnType<typeof buildTestApp>;

beforeEach(() => {
  app = buildTestApp();
});

afterEach(async () => {
  await app.close();
});

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

test("GET /items returns every item under an items key", async () => {
  await createItem(app, "One");
  await createItem(app, "Two");
  await createItem(app, "Three");

  const response = await app.inject({ method: "GET", url: "/items" });
  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(Array.isArray(body.items)).toBe(true);
  expect(body.items).toHaveLength(3);
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
