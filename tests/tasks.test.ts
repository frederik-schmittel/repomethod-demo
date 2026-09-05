import { afterEach, beforeEach, expect, test } from "vitest";
import { buildTestApp, createTask } from "./helpers/buildTestApp.js";

let app: ReturnType<typeof buildTestApp>;

beforeEach(() => {
  app = buildTestApp();
});

afterEach(async () => {
  await app.close();
});

async function seedTasks(count: number): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await createTask(app, `Task ${i + 1}`);
  }
}

test("creates a task with a default status of open", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/tasks",
    payload: { title: "Write docs" },
  });
  expect(response.statusCode).toBe(201);
  expect(response.json()).toMatchObject({ title: "Write docs", status: "open" });
});

test("rejects an unknown status", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/tasks",
    payload: { title: "Bad", status: "archived" },
  });
  expect(response.statusCode).toBe(422);
});

test("GET /tasks is paginated with a pagination block", async () => {
  await seedTasks(25);

  const first = await app.inject({ method: "GET", url: "/tasks?limit=10" });
  expect(first.statusCode).toBe(200);
  const firstBody = first.json();
  expect(firstBody.items).toHaveLength(10);
  expect(firstBody.pagination).toMatchObject({
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3,
    hasMore: true,
  });

  const last = await app.inject({
    method: "GET",
    url: "/tasks?page=3&limit=10",
  });
  expect(last.json().items).toHaveLength(5);
  expect(last.json().pagination.hasMore).toBe(false);
});

test("GET /tasks applies defaults with no query params", async () => {
  await seedTasks(3);
  const response = await app.inject({ method: "GET", url: "/tasks" });
  expect(response.json().pagination).toMatchObject({ page: 1, limit: 20 });
});

test("rejects an out-of-range limit with 400", async () => {
  const response = await app.inject({ method: "GET", url: "/tasks?limit=999" });
  expect(response.statusCode).toBe(400);
});

test("rejects a non-integer page with 400", async () => {
  const response = await app.inject({ method: "GET", url: "/tasks?page=abc" });
  expect(response.statusCode).toBe(400);
});
